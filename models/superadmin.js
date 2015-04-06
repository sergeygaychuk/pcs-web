/* models/superadmin.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict'

var bcrypt = require('bcrypt');
var config = require('../config');

function Superadmin() {
  this._id = config.saId;
  this.email = config.saEmail;
  this.admin = false;
  this.superadmin = true;
  this.name = "Superadmin";

  this.authenticate = function(password, cb) {
    bcrypt.compare(password ? password : '', config.saPasswordHash, cb);
  };

  this.can = function(action, klass, next) {
    return next(true);
  }
}

Superadmin.findById = function(id, cb) {
  if (id === config.saId) {
    cb(null, new Superadmin());
  } else {
    cb(null, null);
  }
};

Superadmin.findByEmail = function(email, cb) {
  if (email === config.saEmail) {
    cb(null, new Superadmin());
  } else {
    cb(null, null);
  }
};

module.exports = Superadmin;

// vim:ts=2 sts=2 sw=2 et:

