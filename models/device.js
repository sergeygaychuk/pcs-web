/* models/device.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var device_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long' },
    trim: true
  },
  sn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

device_schema.index({ name: 1 }, { unique: 1 });
device_schema.index({ sn: 1 });
device_schema.index({ owner: 1, _id: 1 });

var Device = mongoose.model('Device', device_schema);

module.exports = Device;

// vim:ts=2 sts=2 sw=2 et:

