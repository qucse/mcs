TrackingService = require('../services/TrackingService');
const TrajectoryPointRepository = require('../repos/TrajectoryPointRepository');
const clusterInfoRepo = require('../repos/ClusterInfoRepository');
const routeInfoRepository = require('../repos/RouteInfoRepository');
const utils = require('../services/Utils');
const StaticMaps = require('staticmaps');


class Testing {
    async clustering_test() {
        TrackingService.discoverClusters().then(res => {
            console.log(res);
        });
    }

    async cluster_history_test() {
        let clusters = await TrackingService.discoverClusters();
        let history = await TrackingService.clusterHistory(clusters['clusters'][0], clusters.startDate, clusters.endDate);
        console.log(history);
    }

    async cluster_info_add_test() {
        let cluster = {'passengers': [15, 16, 17, 11, 12, 13, 14]};
        console.log(await clusterInfoRepo.AddCluster(cluster))
    }

    async cluster_similarity_check_test() {
        let cluster = {'passengers': [3, 4, 5]};
        console.log(await clusterInfoRepo.getSimilar(cluster))
    }

    async ckuster_point_on_trajectiry_test() {
        let startDate = new Date('2020-04-06T09:00:00.000+00:00');
        let endDate = new Date('2020-04-06T09:02:30.000+00:00');
        let data = await TrajectoryPointRepository.getByTime(startDate, endDate);
        let clusters = await TrackingService.discoverClusters(data.data);
        let history = await TrackingService.clusterHistory(clusters[0], startDate, endDate);
        history.map((val, index) => {
            return val.push(index)
        });
        TrackingService.checkPointOnTrajectory(history).then(res => {
            console.log(res)
        })
    }

    async route_info_data_init() {
        routeInfoRepository.init()
    }

    async cluster_info_object_update() {
        let objectID = "5e86648c380daf3d485c027f";
        let newObject = {
            '_id': objectID,
            'passengers': [1, 2, 3, 4, 20, 30, 40],
            routeId: 110,
            shapeId: 11,
            history: [[50.2, 25.3], [50.2, 25.3], [50.2, 25.3], [50.2, 25.3]],
            lastUpdated: Date.now(),
        };
        clusterInfoRepo.update(newObject, objectID).then(res => {
            console.log(res)
        })

    }

    async test_static_maps() {
        const options = {
            width: 1024,
            height: 720,
            tileUrl: 'https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=YvjfItK8XO38uwADRsrJ',
            tileSize: 512,
            // reverseY : true,
        };

        const map = new StaticMaps(options);
        const marker = {
            img: `${__dirname}/../data/bus.png`, // can also be a URL
            offsetX: 16,
            offsetY: 32,
            width: 32,
            height: 32,
            coord: [51.53517, 25.27983]
        };

        let route = await utils.readFile('data/trip_11.csv');
        route = route.map(x => {
            let temp = x.split(',')
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });
        // console.log(route[2]);
        const polyline = {
            coords: route.slice(0, route.length - 1),
            color: '#0000FFBB',
            width: 3,
        };

        map.addLine(polyline);

        map.addMarker(marker);

        const zoom = 12;
        const center = [51.5306, 25.2580];

        map.render(center, zoom)
            .then(() => map.image.save(`testing/map/${Date.now()}.png`, {compressionLevel: 9}))
            .then(() => console.log('File saved!'))
            .catch(function (err) {
                console.log(err);
            });
    }
}

module.exports = new Testing();