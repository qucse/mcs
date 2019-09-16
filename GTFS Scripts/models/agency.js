const mongoose = require('mongoose');

const AgencySchema = mongoose.Schema({
  agency_id: Number,
  agency_name: String,
  agency_url: String,
  agency_timezone: String,
  agency_lang: String
});

const Agency = mongoose.model('Agency', AgencySchema);
module.exports = Agency;
