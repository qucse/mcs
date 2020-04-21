const mongoose = require('mongoose');

const RouteSchema = mongoose.Schema({
	trip_id : Number ,
	shape_id: Number,
	road_ids: [Number],
});

const routeInfo = mongoose.model('tripInfo', RouteSchema); // rename to route

module.exports = routeInfo;
