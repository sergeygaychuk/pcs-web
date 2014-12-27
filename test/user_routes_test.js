/* test/user_routes_test.js -- test User routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var User = require('../models/user');
var Routes = require('../routes/user');
var router = require('./support/router');

describe('User routes', function() {
  var user;
  before(function(done) {
    Factory.create('user', function (u) { user = u; done(); });
  });

  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  var admin;
  before(function(done) {
    Factory.create('admin', function (u) { admin = u; done(); });
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

      it("should return 404 if no user", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(404);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should deny others profiles to non-admin", function(done) {
        req.user = user;
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(403);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(u) {
            expect(Object.keys(u)).to.eql(['_id', 'name', 'email', 'admin']);
            expect(u._id).to.eql(operator._id);
            expect(u.name).to.eql(operator.name);
            expect(u.email).to.eql(operator.email);
            expect(u.admin).to.eql(operator.admin);
            done();
          },
        };
        req.user = operator;
        req.user.some_field = true;
        router(Routes.show, req, res);
      });
    });
  });

  describe("#update", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.update, req, res);
    });

    describe("when operator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should deny non-admins", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.eql(403);
            done();
          },
        };
        req.user = user;
        router(Routes.update, req, res);
      });

      it("should modify own name", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              operator.name = req.body.name;
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: "update.operator",
        };
        router(Routes.update, req, res);
      });

      it("should not modify admin status", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(operator.admin);
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          admin: 1,
        };
        router(Routes.update, req, res);
      });

      it("should not modify email", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u).not.to.be(500);
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.email).to.eql(operator.email);
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(operator.admin);
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: 'new_user@example.com',
          name: operator.name,
        };
        router(Routes.update, req, res);
      });

      it("should modify own password", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).to.be.okt;
              });
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          password: "1111111",
          confirmation: "1111111",
        };
        router(Routes.update, req, res);
      });

      it("should match password to confirmation", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).not.to.be.ok;
              });
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          password: "1111111",
          confirmation: "1111112",
        };
        router(Routes.update, req, res);
      });

      it("should report validation errors");
    });

    describe("when administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: admin._id } };
      });

      it("should modify own name", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: admin.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              admin.name = req.body.name;
              expect(u.admin).to.eql(admin.admin);
              done();
            });
          },
        };
        req.user = admin;
        req.body = {
          email: admin.email,
          name: 'update admin',
          admin: true,
        };
        router(Routes.update, req, res);
      });

      it("should not modify own admin status", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: admin.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(admin.admin);
              done();
            });
          },
        };
        req.user = admin;
        req.body = {
          email: admin.email,
          name: admin.name,
          admin: false,
        };
        router(Routes.update, req, res);
      });

      it("should modify user names", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              user.name = req.body.name;
              expect(u.admin).to.eql(user.admin);
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: user.email,
          name: 'update.user',
          admin: user.admin,
        };
        router(Routes.update, req, res);
      });

      it("should not modify user emails", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(user.admin);
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: 'new_user@example.com',
          name: user.name,
          admin: user.admin,
        };
        router(Routes.update, req, res);
      });

      it("should modify user passwords", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).to.be.ok;
              });
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: user.email,
          name: user.name,
          password: "1111111",
          confirmation: "1111111",
        };
        router(Routes.update, req, res);
      });
    });
  });

  describe("#index", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.index, req, res);
    });

    it("should deny access to non-admin users", function(done) {
      var req = { session: { operatorId: operator._id } },
      res = {
        locals: {},
        send: function(code) {
          expect(code).to.eql(403);
          done();
        },
      };
      router(Routes.index, req, res);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
