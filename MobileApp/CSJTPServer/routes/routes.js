const router = require('express').Router(),
	GeoInfo = require('../models/GeoInfo');

router
	.route('/geoinfo')
	.get(async (req, res) => {
		const geo = await GeoInfo.find({});
		res.send(geo);
	})
	.post(async (req, res) => {
		const geo = await new GeoInfo(req.body).save();
	});

module.exports = router;
