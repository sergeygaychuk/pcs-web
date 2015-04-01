/* models/right.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var right_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long' },
    trim: true },
  autoAssigned: {
    type: Boolean,
    default: false },
  abilities: {
    type: {},
    default: {} }
});

var Right = mongoose.model('Right', right_schema);

//define default schemas

module.exports = Right;

// vim:ts=2 sts=2 sw=2 et:

