const mongoose = require('mongoose');

const calendarSchema = mongoose.Schema({
  service_id: Number,
  monday: Number,
  tuesday: Number,
  wednesday: Number,
  thursday: Number,
  friday: Number,
  saturday: Number,
  sunday: Number,
  start_date: Number,
  end_date: Number
});

const calendar = mongoose.model('calendar', calendarSchema);
module.exports = calendar;
