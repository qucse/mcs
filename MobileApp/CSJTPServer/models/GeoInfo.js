const mongoose = require('mongoose');

const GeoSchema = mongoose.Schema({
	time: Number,
	bearing: Number,
	speed: Number,
	altitude: Number,
	accuracy: Number,
	longitude: Number,
	latitude: Number,
	provider: String
});

const GeoInfo = mongoose.model('GeoInfo', GeoSchema);

module.exports = GeoInfo;
