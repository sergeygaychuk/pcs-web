/* models/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length.max(50),
      msg: 'name is too long' },
    trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-z][\w+\-.]+@[a-z\d\-]+(?:\.[a-z\d\-]+)*\.[a-z]+$/i,
    trim: true }
});

var User = mongoose.model('User', user_schema);

module.exports = User;

// vim:ts=2 sts=2 sw=2 et:
