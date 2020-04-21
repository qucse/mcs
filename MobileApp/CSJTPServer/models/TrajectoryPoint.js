const mongoose = require('mongoose');

const TrajectoryPointSchema = mongoose.Schema({
	id : Number ,
	time: Date,
	bearing: Number,
	speed: Number,
	altitude: Number,
	accuracy: Number,
	longitude: Number,
	latitude: Number,
	provider: String
});

const TrajectoryPoint = mongoose.model('TrajectoryPoint', TrajectoryPointSchema); // rename to Trajectory point

module.exports = TrajectoryPoint;
