const mongoose = require('mongoose');

const routeSchema = mongoose.Schema({
  route_id: Number,
  agency_id: Number,
  route_short_name: String,
  route_long_name: String,
  route_type: Number,
  route_desc: String,
  route_color: String,
  route_text_color: String,
  route_url: String
});

// routeSchema.pre('save', async next => {
//   const route = this,
//     Agency = require('./agency');

//   try {
//     let agency = await Agency.findOne({ agency_id: route.agency_id });
//     console.log(route);
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// });

const route = mongoose.model('route', routeSchema);
module.exports = route;
