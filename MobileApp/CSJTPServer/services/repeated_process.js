const TrajectoryPointRepository = require('../repos/TrajectoryPointRepository');
const clusterInfoRepo = require('../repos/ClusterInfoRepository');
const TrackingService = require('../services/TrackingService');
const StaticMaps = require('staticmaps');
const utils = require('../services/Utils');
const stats = require("stats-analysis");

class Repeated_process {

    start() {
        // starts  and repeats the process of tracking gps trajectories in the system
        let period = 0.05 * 60000; // in minutes
        let startTime = new Date('2020-04-06T09:01:40.000+00:00');
        let time = new Date('2020-04-06T09:01:40.000+00:00');
        setInterval(async () => {
            // simulate time
            startTime = time;
            time = new Date(new Date(time).valueOf() + (5 * 60000));
            // get gps data
            let geoData = await TrajectoryPointRepository.getByTime(startTime, time, 6);
            // console.log(geoData.data[0]);
            // console.log('got GPS Data');
            // get data clusters
            let clusters = await TrackingService.discoverClusters(geoData.data);
            // console.log('got clusters');
            clusters.forEach((cluster) => {
                // get cluster movement
                TrackingService.clusterHistory(cluster, startTime, time).then(async (history) => {
                    // add sequence , formatting for next step
                    let history_json = history.map((val, index) => {
                        return {'lat': val[1], 'long': val[0]}
                    });
                    let cluster_obj = {
                        passengers: cluster
                    };
                    // check for existence of similar clusters
                    let similar_clusters = await clusterInfoRepo.getSimilar(cluster_obj);
                    // if there is similar cluster , update the old. if not create a new one
                    if (similar_clusters.length > 0 && similar_clusters[0].score > 0.6) {
                        let oldCluster = await clusterInfoRepo.getWithId(similar_clusters[0]._id);
                        oldCluster.passengers = cluster_obj.passengers;
                        let history_sequence = history.map((val, index) => {
                            val.push(index);
                            return val;
                        });
                        // check for deviation in the trajectory movement
                        let trajectory_test = await TrackingService.checkPointOnTrajectory(history_sequence, oldCluster.shapeId);
                        // if there is no deviation update the cluster history
                        if (trajectory_test[0].score > 0.6) {
                            oldCluster.history.push(...history);
                            oldCluster.lastUpdated = time;
                            await clusterInfoRepo.update(oldCluster, oldCluster._id);
                            await this.drawPathOnMap(oldCluster.history);
                            console.log("cluster was update on same route");
                        } else {
                            // if there is a deviation, recalculate the cluster route
                            let matching_result = await TrackingService.detectRoute(history_json);
                            oldCluster.history = history;
                            oldCluster.shapeId = matching_result[0].shape_id;
                            oldCluster.routeId = matching_result[0].trip_id;
                            cluster_obj.lastUpdated = time;
                            await clusterInfoRepo.update(oldCluster, oldCluster._id);
                            await this.drawPathOnMap(oldCluster.history);
                            console.log("cluster was updated on different route");
                        }

                    } else {
                        // create new cluster
                        let matching_result = await TrackingService.detectRoute(history_json);
                        cluster_obj.shapeId = matching_result[0].shape_id;
                        cluster_obj.routeId = matching_result[0].trip_id;
                        cluster_obj.history = history;
                        cluster_obj.lastUpdated = time;
                        await clusterInfoRepo.addCluster(cluster_obj);
                        await this.drawPathOnMap(cluster_obj.history);
                        console.log("new cluster Added");
                    }
                });

            });

        }, period);

    }

    async startDynamic() {
        // starts  and repeats the process of tracking gps trajectories in the system
        let clusteringPeriod = 0.1 * 60000; // in minutes
        let updatingPeriod = 0.01 * 60000; // in minutes
        let clusterStartTime = new Date('2020-04-06T09:01:40.000+00:00');
        let clusterTime = clusterStartTime;
        let updateTime = clusterStartTime;


        clusterTime = new Date(new Date(clusterTime).valueOf() + (5 * 60000));
        this.discover_cluster(clusterStartTime, clusterTime);
        setInterval(async () => {
            console.log('invking clustering');
            clusterStartTime = clusterTime;
            clusterTime = new Date(new Date(clusterTime).valueOf() + (5 * 60000));
            this.discover_cluster(clusterStartTime, clusterTime)
        }, clusteringPeriod);


        await this.update_Cluster(updateTime);
        setInterval(async () => {
            updateTime = new Date(new Date(updateTime).valueOf() + (0.5 * 60000));
            console.log(`invoking update with time ${updateTime}`);
            await this.update_Cluster(updateTime);
        }, updatingPeriod)

    }

    async update_Cluster(time) {
        let clusters = await clusterInfoRepo.getAllClusters();
        for (let i = 0; i < clusters.length; i++) {
            // get the cluster member  updated location
            let result = await TrajectoryPointRepository.getByIDsAndTime(clusters[i].passengers, time);
            if (result.length === 0) {
                return
            }
            // filter outlair
            let result_map = result.map(x => (x.latitude + 90) * 180 + x.longitude); // (lat+90)*180+long will gives you a single number for everything within 1 degree
            let outliers = await stats.indexOfOutliers(result_map, stats.outlierMethod.MAD);
            result = result.filter((point, index) => !outliers.includes(index));
            result = result.map(x => [x.latitude, x.longitude]);
            let center = await utils.getLatLngCenter(result);
            center = [center[1], center[0]];
            clusters[i].history.push(center);
            await clusterInfoRepo.update(clusters[i], clusters[i]._id);
            console.log(`cluster updated with time `);
            await this.drawPathOnMap(clusters[i].history);

        }
    }

    async discover_cluster(startTime, time) {
        // get gps data
        let geoData = await TrajectoryPointRepository.getByTime(startTime, time, 6);
        let clusters = await TrackingService.discoverClusters(geoData.data);
        // console.log('got clusters');
        for (let i = 0; i < clusters.length; i++) {
            // get cluster movement
            // add sequence , formatting for next step
            let cluster_obj = {
                passengers: clusters[i]
            };
            // check for existence of similar clusters
            let similar_clusters = await clusterInfoRepo.getSimilar(cluster_obj);
            // if there is similar cluster , update the old. if not create a new one
            if (similar_clusters.length > 0 && similar_clusters[0].score > 0.6) {
                let oldCluster = await clusterInfoRepo.getWithId(similar_clusters[0]._id);
                oldCluster.passengers = cluster_obj.passengers;
                if (oldCluster.history.length === 0) {
                    console.log("cluster was unchanged");
                    return
                }
                let history = oldCluster.history.map((val, index) => {
                    val = [val[0], val[1], index];
                    return val;
                });
                let roadIDS = await TrackingService.mapMatch(history);
                console.log(roadIDS);
                let clusterRoute = await TrackingService.detectRoute({ids: roadIDS});
                if (oldCluster.shapeId === clusterRoute[0].shape_id && oldCluster.routeId === clusterRoute[0].trip_id) {
                    oldCluster.deviationCounter = 0;
                    await clusterInfoRepo.update(oldCluster, oldCluster._id);
                    console.log("cluster was updated on same route");
                } else {
                    // allow some time before deleting the history
                    if (oldCluster.deviationCounter === 3) {
                        oldCluster.history = [];
                        oldCluster.shapeId = clusterRoute[0].shape_id;
                        oldCluster.routeId = clusterRoute[0].trip_id;
                        oldCluster.deviationCounter = 0;
                        await clusterInfoRepo.update(oldCluster, oldCluster._id);
                        console.log("cluster was updated on different route");
                    } else {
                        oldCluster.shapeId = clusterRoute[0].shape_id;
                        oldCluster.routeId = clusterRoute[0].trip_id;
                        oldCluster.deviationCounter += 1;
                        await clusterInfoRepo.update(oldCluster, oldCluster._id);
                        console.log("cluster was updated on different route , keep history , increment deviation counter");

                    }
                }
            } else {
                // create new cluster
                cluster_obj.shapeId = -1;
                cluster_obj.routeId = -1;
                cluster_obj.history = [];
                cluster_obj.deviationCounter = 0;
                cluster_obj.lastUpdated = time;
                await clusterInfoRepo.addCluster(cluster_obj);
                console.log("new cluster Added");
            }

        }

    }

    async drawPathOnMap(path) {
        const options = {
            width: 1024,
            height: 720,
            tileUrl: 'https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=YvjfItK8XO38uwADRsrJ',
            tileSize: 512,
            // reverseY : true,
        };

        const map = new StaticMaps(options);
        // testing route, in this case we are testing on route 11 , shape 110
        let route = await utils.readFile('data/trip_11.csv');
        route = route.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });

        // console.log(route[2]);
        const polyline = {
            coords: route.slice(0, route.length - 1),
            color: '#0000FFBB',
            width: 3,
        };

        map.addLine(polyline);

        const polyline2 = {
            coords: path.slice(0, path.length - 1),
            color: '#FF0112',
            width: 3,
        };
        map.addLine(polyline2);


        const marker = {
            img: `${__dirname}/../data/bus.png`, // can also be a URL
            offsetX: 16,
            offsetY: 32,
            width: 32,
            height: 32,
            coord: path[path.length - 1]
        };

        map.addMarker(marker);

        const zoom = 11;
        const center = [51.5306, 25.2580];

        map.render(center, zoom)
            .then(() => map.image.save(`testing/map/${Date.now()}.png`, {compressionLevel: 9}))
            .then(() => console.log('File saved!'))
            .catch(function (err) {
                console.log(err);
            });

    }


}

module.exports = new Repeated_process();