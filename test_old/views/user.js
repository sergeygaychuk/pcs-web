/* test/views/user.js -- test user pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');
var async = require('async');

var browser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var User = require('../../models/user');
var attrs = {}

describe('User', function(){
  var user;

  beforeEach(function () {
    browser = new Browser({ site: global.url });
  })

  before(function (done) {
    async.times(26, function (n, next) {
      Factory.create('user', function (u) { next(null, u); });
    },
    function (err, users) {
      user = users[0];
      done();
    });
  });

  describe('profile page', function () {
    beforeEach(function (done) {
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), user.email)
        .fill(t('user.password'), user.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          browser.visit('/users/' + user._id.toString()).then(done, done);
        }, done);
      }, done);
    })

    it('should display user', function () {
      expect(browser.statusCode).to.be(200);
      expect(browser.query("input[value='"+user.name+"']")).to.be.ok();
      expect(browser.query('input[value="'+user.email+'"]')).to.be.ok();
      expect(browser.text('.tp-menu-side li.active a')).to.contain(t('user.self.plural'));
    })

    describe('edit with valid data', function () {
      beforeEach(function (done) {
        user.name = 'Update Name';
        user.email = 'u@example.com';
        user.password = 'newPassword';
        user.confirmation = 'newPassword';
        browser
        .fill(t('user.name'), user.name)
        .fill(t('user.email'), user.email)
        .fill(t('user.password'), user.password)
        .fill(t('user.confirmation'), user.confirmation)
        .pressButton(t('action.put'))
        .then(done, done)
      })

      it('should show updated data', function (done) {
        expect(browser.statusCode).to.be(200);
        expect(browser.query("input[value='"+user.name+"']")).to.be.ok();
        expect(browser.query('input[value="'+user.email+'"]')).to.be.ok();
        expect(browser.queryAll('.tp-flash .alert.alert-success').length).to.be(1);
        User.findById(user._id, function (err, u) {
          u.name.should.equal(user.name);
          u.email.should.equal(user.email);
          u.authenticate(user.password, function (err, valid) {
            expect(valid).to.be(true);
            done();
          });
        });
      })
    })

    describe('edit with invalid data', function () {
      beforeEach(function (done) {
        browser
        .fill(t('user.name'), '')
        .fill(t('user.email'), '')
        .pressButton(t('action.put'))
        .then(done, done);
      })

      it('should display errors', function () {
        expect(browser.statusCode).to.be(200);
        expect(browser.query('.has-error label.help-block[for="name"]')).to.be.ok();
        expect(browser.query('.has-error label.help-block[for="email"]')).to.be.ok();
        expect(browser.queryAll('.tp-flash .alert.alert-danger').length).to.be(1);
      })
    })
  })

  describe('administration of', function () {
    var admin;
    before(function (done) {
      Factory.create('admin', function (a) { admin = a; done(); });
    })

    beforeEach(function (done) {
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), admin.email)
        .fill(t('user.password'), admin.password)
        .pressButton(t('session.sign_in'))
        .then(done, done);
      }, done);
    })

    describe('index page', function () {
      beforeEach(function (done) {
        browser.visit('/users').then(done, done);
      })

      it('should list users with pagination', function () {
        expect(browser.statusCode).to.be(200);
        expect(browser.location.pathname).to.be('/users');
        expect(browser.queryAll('table.tp-data tr').length).to.be(25);
        expect(browser.query('a[href="/users?page=1"]')).to.be.ok();
        User
        .find().sort({ name: 1 }).limit(25)
        .exec(function (err, users) {
          users.forEach(function (u) {
            expect(browser.text('table.tp-data td.tp-sender')).to.contain(u.name);
            expect(browser.text('table.tp-data td.tp-email')).to.contain(u.email);
          });
        })
      })
    })

    describe('bad profile page', function () {
      beforeEach(function (done) {
        var c = browser.console;
        browser.console = { error: function () {} };
        browser.visit('/users/bad').then(done, function () { browser.console = c; done(); });
      })

      it('should report error', function () {
        expect(browser.statusCode).to.be(404);
      })
    })

    describe('profile page', function () {
      beforeEach(function (done) {
        browser.visit('/users/' + user._id).then(done, done);
      })

      it('should render user profile', function () {
        expect(browser.statusCode).to.be(200);
        expect(browser.location.pathname).to.be('/users/' + user._id);
      })

      describe('admin attribute', function () {
        beforeEach(function (done) {
          browser
          .check(t('user.admin'))
          .pressButton(t('action.put'))
          .then(done, done);
        })

        it('should assign admin', function (done) {
          User.findById(user._id, function (err, u) {
            expect(u.admin).to.be(true);
            done();
          });
        })
      })
    })

    describe('new users', function () {
      beforeEach(function (done) {
        browser.visit('/users/new').then(done, done);
      })

      it('should index provide input form', function () {
        expect(browser.statusCode).to.be(200);
        expect(browser.location.pathname).to.be('/users/new');
      })

      describe('with valid data', function () {
        var newUser = new User();
        beforeEach(function (done) {
          newUser.name = 'New Name';
          newUser.email = 'new@example.com';
          newUser.password = 'newPassword';
          newUser.confirmation = 'newPassword';
          browser
          .fill(t('user.name'), newUser.name)
          .fill(t('user.email'), newUser.email)
          .fill(t('user.password'), newUser.password)
          .fill(t('user.confirmation'), newUser.confirmation)
          .pressButton(t('action.undefined'))
          .then(done, done)
        })

        it('should show created user', function (done) {
          expect(browser.statusCode).to.be(200);
          expect(browser.query("input[value='"+newUser.name+"']")).to.be.ok();
          expect(browser.query('input[value="'+newUser.email+'"]')).to.be.ok();
          expect(browser.queryAll('.tp-flash .alert.alert-success').length).to.be(1);
          User.findOne({ email: newUser.email }, function (err, u) {
            u.name.should.equal(newUser.name);
            u.email.should.equal(newUser.email);
            u.authenticate(newUser.password, function (err, valid) {
              expect(valid).to.be(true);
              done();
            });
          });
        })
      })
    })
  })
});

// vim:ts=2 sts=2 sw=2 et: