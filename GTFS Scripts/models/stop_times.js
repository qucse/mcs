const mongoose = require('mongoose');

const stopTimeSchema = mongoose.Schema({
  trip_id: Number,
  arrival_time: String,
  departure_time: String,
  stop_id: Number,
  stop_sequence: Number,
  pickup_type: Number,
  drop_off_type: Number
});

const stopTime = mongoose.model('stop Time', stopTimeSchema);
module.exports = stopTime;
