/* test/support/server.js -- start application for testing
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('../../app')
var port = app.get('port');
var User = require('../../models/user');
var Device = require('../../models/device');
var Factory = require('factory-lady');
var Faker = require('Faker');

if (!port) {
  var http = require('http');
  var server = http.createServer(app);
  server.listen(app.get('port'));
  port = server.address().port;
}

var userCounter = 0;

Factory.define('user', User, {
  password: 'password',
  confirmation: 'password',
  name: function (cb) { cb(Faker.Name.findName()) },
  email: function (cb) { cb('user-' + ++userCounter + '@example.com') }
})

Factory.define('admin', User, {
  password: 'password',
  confirmation: 'password',
  admin: true,
  name: function (cb) { cb(Faker.Name.findName()) },
  email: function (cb) { cb('admin-' + ++userCounter + '@example.com') }
})

var deviceCounter = 0;

Factory.define('device', Device, {
  name: function (cb) { cb('Example Device ' + ++deviceCounter) },
  filepath: function (cb) { cb('/tmp/dev' + deviceCounter) }
})

global.url = 'http://localhost:' + port;
global.i18n = app.i18n;
global.Factory = Factory;

// vim:ts=2 sts=2 sw=2 et: