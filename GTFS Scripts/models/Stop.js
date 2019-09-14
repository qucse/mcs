const mongoose = require('mongoose');

const stopSchema = mongoose.Schema({
  stop_id: Number,
  stop_name: String,
  stop_lat: Number,
  stop_lon: Number,
  wheelchair_boarding: Number,
  stop_url: String,
  location_type: Number,
  parent_station: Number
});

const Stop = mongoose.model('stop', stopSchema);
module.exports = Stop;
