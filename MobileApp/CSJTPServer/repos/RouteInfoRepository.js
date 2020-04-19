RouteInfo = require('../models/routeInfo');
fs = require('fs');

class RouteInfoRepository {
    // async init() {
    //     fs.readFile('data/trips_nodes.txt', 'utf8',(err, data) => {
    //         if (err) throw err;
    //         data = data.split('\n');
    //         let result = [];
    //         for (let i= 0 ; i < data.length-1 ; i = i+ 2 ) {
    //             let routeInfo = data[i].split(',');
    //             let trip_id = parseInt(routeInfo[0]);
    //             let shape_id = parseInt(routeInfo[1]);
    //             let road_ids = data[i+1].split(',').map(x=> parseInt(x));
    //             new RouteInfo({trip_id,shape_id,road_ids }).save()
    //         }
    //         console.log(result)
    //     });
    // }

    async check_similarity(road_ids, shape_id) {
        let result = await RouteInfo.aggregate([
            {
                '$match': {
                    'shape_id': shape_id
                }
            }, {
                '$unwind': {
                    'path': '$road_ids'
                }
            }, {
                '$match': {
                    'road_ids': {
                        '$in': road_ids
                    }
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'count': {
                        '$sum': 1
                    }
                }
            }, {
                '$project': {
                    '_id': 1,
                    'count': 1,
                    'score': {
                        '$divide': [
                            '$count', road_ids.length
                        ]
                    }
                }
            }
        ]);
        if (result.length === 0) {
            return [{score: 0}]
        } else {
            return result
        }
    }

    async getShapesAndRoutes() {
        try {
            return await RouteInfo.aggregate([{"$project": {trip_id: 1, shape_id: 1 , _id : 0}}])
        } catch (e) {
            throw new Error(e)
        }
    }
}

module.exports = new RouteInfoRepository();