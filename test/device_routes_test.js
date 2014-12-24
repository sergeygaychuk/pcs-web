/* test/device_routes_test.js -- test Device routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Device = require('../models/device');
var Routes = require('../routes/device');
var router = require('./support/router');

var deviceAttrs = {
  name: "Some device",
};

describe('Device routes', function() {
  var device;
  before(function(done) {
    Factory.create('device', function (d) { device = d; done(); });
  });

  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  describe("#load", function() {
    it("should find by id and assign device to req", function(done) {
      var req = { },
      id = device._id;

      Routes.load(req, {}, function() {
        expect(req.device.toJSON()).to.eql(device.toJSON());
        done();
      }, id);
    });

    it("should respond with not found code", function(done) {
      var res = {
        send: function(code) {
          expect(code).to.eql(404);
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });

  describe("#show", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.show, req, res);
    });

    describe("when operator logged in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should return 404 if no device", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(404);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(dev) {
            expect(Object.keys(dev)).to.eql(['_id', 'name']);
            expect(dev._id).to.eql(device._id);
            expect(dev.name).to.eql(device.name);
            done();
          },
        };
        req.device = device;
        req.device.some_field = true;
        router(Routes.show, req, res);
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
