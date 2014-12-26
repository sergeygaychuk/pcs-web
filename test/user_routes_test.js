/* test/backend/routes/user_spec.js -- test User's routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var Routes = require('../routes/user');

describe('User routes', function() {
  var user;
  before(function(done) {
    Factory.create('user', function (u) { user = u; done(); });
  });
  describe("#load", function() {
    it("should find by id and assign user to req", function(done) {
      var req = { user: null },
      id = user._id;

      Routes.load(req, {}, function() {
        expect(req.user.toJSON()).to.eql(user.toJSON());
        done();
      }, id);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et: