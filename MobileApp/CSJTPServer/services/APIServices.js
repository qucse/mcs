const geoInfoRepo = require('../repos/TrajectoryPointRepository');
const clusterInfoRepo = require('../repos/ClusterInfoRepository');
const RouteInfo = require('../repos/RouteInfoRepository');

const config = require('../configurations');
const fetch = require("node-fetch");
const utils = require("./Utils");

class APIServices {

    async liveLocation(req, res) {
        try {
            console.log(req.params);
            const livePos = await clusterInfoRepo.liveLocation(parseInt(req.params.shapeId));
            console.log(livePos);
            res.status(200).json(livePos);
        } catch (e) {
            console.log(e);
            res.status(500);
        }
    }

    async getShapesAndRoutes(req, res) {
        try {
            const result = await RouteInfo.getShapesAndRoutes();
            res.status(200).json(result)
        } catch (e) {
            console.log(e);
            res.status(500).send(e)
        }
    }


}

module.exports = new APIServices();