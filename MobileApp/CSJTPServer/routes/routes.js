const router = require('express').Router(),
    TrajectoryPoint = require('../models/TrajectoryPoint');
const repeatedProcess = require('../services/repeated_process');
TrackingService = require('../services/TrackingService');
TrajectoryPointRepository = require('../repos/TrajectoryPointRepository');
Testing = require('../testing/testing');
const APIService = require('../services/APIServices');

router.route('/geoinfo')
    .get(async (req, res) => {
        const geo = await TrajectoryPoint.find({});
        res.send(geo);
    })
    .post(async (req, res) => {
        const geo = await new TrajectoryPoint(req.body).save();
        // console.log(req.body);
        res.status(200).send('model added')
    });

router.route('/bus').get(APIService.getShapesAndRoutes);

router.route('/bus/:shapeId')
    .get(APIService.liveLocation);


// TrajectoryPointRepository.init();
// Testing.ckuster_point_on_trajectiry_test();
repeatedProcess.startDynamic();
module.exports = router;
