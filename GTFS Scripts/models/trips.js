const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
  route_id: Number,
  service_id: Number,
  trip_id: Number,
  direction_id: Number,
  shape_id: Number,
  trip_headsign: String,
  trip_short_name: String,
  wheelchair_accessible: Number,
  bikes_allowed: Number
});

const Trip = mongoose.model('trip', tripSchema);
module.exports = Trip;
