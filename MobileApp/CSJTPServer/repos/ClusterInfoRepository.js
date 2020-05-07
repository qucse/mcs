ClusterInfo = require('../models/ClusterInfo');

class ClusterInfoRepository {

    async getWithId(id) {
        return ClusterInfo.findOne({'_id': id})
    }

    async liveLocation(shapeId) {
        try {
            let result = [];
            let clusters = await ClusterInfo.find({shapeId});
            clusters.forEach(cluster => {
                let busInfo = {};
                busInfo.position = cluster.history[cluster.history.length - 1];
                busInfo.lastUpdated = cluster.lastUpdated;
                result.push(busInfo)
            });
            return result;
        } catch (e) {
            throw new Error(e)
        }
    }

    async addCluster(cluster) {
        return await new ClusterInfo(cluster).save()
    }

    async getSimilar(cluster) {
        // compare 2 clusters passed on the passenger of each of them
        let res = await ClusterInfo.aggregate([
            {
                '$project': {
                    '_id': 1,
                    'passengers': 1,
                    'length': {
                        '$size': '$passengers'
                    }
                }
            }, {
                '$unwind': {
                    'path': '$passengers'
                }
            }, {
                '$match': {
                    'passengers': {
                        '$in': cluster.passengers
                    }
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'count': {
                        '$sum': 1
                    },
                    'length': {
                        '$first': '$length'
                    }
                }
            }, {
                '$project': {
                    '_id': 1,
                    'count': 1,
                    'score': {
                        '$divide': [
                            '$count', '$length'
                        ]
                    }
                }
            }, {
                '$sort': {
                    'score': -1
                }
            }
        ]);
        return res
    }

    async update(newObject, objectID) {
        return await ClusterInfo.replaceOne({'_id': objectID}, newObject);
    }

    async getAllClusters(){
        return await ClusterInfo.find({});
    }
}

module.exports = new ClusterInfoRepository();