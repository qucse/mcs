const mongoose = require('mongoose');

const shapeSchema = mongoose.Schema({
  shape_id: Number,
  shape_pt_lat: Number,
  shape_pt_lon: Number,
  shape_pt_sequence: Number
});

const shape = mongoose.model('shape', shapeSchema);
module.exports = shape;
