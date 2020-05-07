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

        let route1 = await utils.readFile('data/trip_11.csv');
        route1 = route1.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });

        // console.log(route[2]);
        const polyline = {
            coords: route1.slice(0, route1.length - 1),
            color: '#0000FFBB',
            width: 3,
        };

        let route2 = await utils.readFile('data/trip_220.csv');
        route2 = route2.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });

        console.log(route2[0]);

        // console.log(route[2]);
        const polyline2 = {
            coords: route2.slice(0, route2.length - 1),
            color: '#16FF00',
            width: 3,
        };

        let route3 = await utils.readFile('data/trip_31020.csv');

        route3 = route3.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });
        console.log(route3[0]);

        const polyline3 = {
            coords: route3.slice(0, route3.length - 1),
            color: '#ff0008',
            width: 3,
        };

        let route4 = await utils.readFile('data/trip_200.csv');
        route4 = route4.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });
        console.log(route4[0]);

        const polyline4 = {
            coords: route4.slice(0, route4.length - 1),
            color: '#00d8ff',
            width: 3,
        };

        let route5 = await utils.readFile('data/trip_10010.csv');
        route5 = route5.map(x => {
            let temp = x.split(',');
            return [parseFloat(temp[1]), parseFloat(temp[0])]
        });
        console.log(route5[0]);

        const polyline5 = {
            coords: route5.slice(0, route5.length - 1),
            color: '#ff009e',
            width: 3,
        };


        const text = {
            coord: [51.5861, 25.3195],
            text: `route: 10 expected 10`,
            size: 30,
            offsetX: 100,
            offsetY: 100,
            width: '10px',
            fill: '#ff1900',
            color: '#ff0008',
            font: 'Calibri'
        };

        map.addText(text);


        map.addLine(polyline);
        map.addLine(polyline2);
        map.addLine(polyline3);
        map.addLine(polyline4);
        map.addLine(polyline5);

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

module.exports = new Testing();