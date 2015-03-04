/* test/device_registration_pages_test.js -- test registration pages, run it with mocha
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var saBrowser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var Superadmin = require('../models/superadmin');
var User = require('../models/user');
var config = require('../config');

describe('Registartion of device', function () {
  before( function () {
    saBrowser = new Browser({ site: global.url });
    selBrowser = new Browser({ site: global.url });
    userBrowser = new Browser({ site: global.url });
  });

  describe("when seller want to create devices", function() {
    it("should signup", function(done) {
      selBrowser.visit('/signin').then(function() {
        selBrowser.clickLink('a[href="/signup"]').then(function() {
          selBrowser
          .fill('name', 'Seller')
          .fill('email', 'seller@asutp.io')
          .fill('password', '123456')
          .fill('confirmation', '123456')
          .pressButton(t('session.sign_up'))
          .then(function() {
            expect(selBrowser.success).to.be(true);
            expect(selBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(selBrowser.location.pathname).to.be('/signin');
            expect(selBrowser.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
            expect(selBrowser.text('title')).to.contain('Sign in');
          })
          .then(done, done)
        });
      });
    });

    describe("follow sign in", function() {
      it("should accept credentials", function(done) {
        selBrowser
        .fill('email', 'seller@asutp.io')
        .fill('password', 123456)
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(selBrowser.success).to.be(true);
          expect(selBrowser.location.pathname).to.be('/');
          expect(selBrowser.text('title')).to.contain('Seller');
        })
        .then(done, done);
      });

      it("should see devices pages", function() {
        expect(selBrowser.query("a[href='#/devices']")).not.to.be(null);
        expect(selBrowser.query("a[href='#/users']").parentNode.style.display).to.be("none");
        expect(selBrowser.query("a[href='#/sites']").parentNode.style.display).to.be("none");
      });

      it("shouldn't see create device", function() {
        expect(selBrowser.query("a[href='#/devices/new']").parentNode.style.display).to.be("none");
      });
    });
  });

  describe('superadmin assign right to create device', function() {
    var seller = null;

    before(function(done) {
      User.findOne({email: 'seller@asutp.io'}, function(err, u) {
        if (err) throw "Cann't find seller";
        seller = u;
        done();
      });
    });

    it('should signin', function (done) {
      saBrowser.visit('/signin').then(function() {
        saBrowser
        .fill(t('user.email'), config.saEmail)
        .fill(t('user.password'), "0987654321")
        .pressButton(t('session.sign_in'))
        .then(function() {
            expect(saBrowser.success).to.be(true);
            expect(saBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(saBrowser.location.pathname).to.be('/');
            expect(saBrowser.text('title')).to.contain("Superadmin");
            done();
        });
      });
    });

    it("should see seller", function() {
      expect(saBrowser.url).to.eql(url + '/#/users');
      expect(seller).not.to.be(null);
      expect(saBrowser.query("table.tp-data td a[href='#/users/" + seller._id + "']").textContent).to.be(seller.name);
    });

    it("should see initial rights for user", function(done) {
      expect(saBrowser.url).to.eql(url + '/#/users');
      saBrowser.clickLink("table.tp-data td a[href='#/users/" + seller._id + "']", function() {
        expect(saBrowser.location.hash).to.be('#/users/' + seller._id);
        expect(saBrowser.query("input[name='name']").value).to.eql(seller.name);
        expect(saBrowser.query("input[name='email']").value).to.eql(seller.email);
        expect(saBrowser.query("input[name='admin']:disabled")).to.be(null);
        expect(saBrowser.query("input[name='admin']:checked")).not.to.be(null);
        expect(saBrowser.query("input[name='password']").value).to.eql("");
        expect(saBrowser.query("input[name='confirmation']").value).to.eql("");
        expect(saBrowser.text("form[name='userForm'] > button")).to.eql("Изменить");
        expect(saBrowser.query("form[name='userForm'] > button:disabled")).not.to.be(null);
        Object.keys(seller.rights).forEach(function(right) {
          seller.rights[right].forEach(function(action) {
            expect(saBrowser.query("input.rights-" + right.toLowerCase() + "-" + action.toLowerCase() + ":checked")).not.to.be(null);
          });
        });
        done();
      });
    });

    it("should see unchecked create, edit and show rights", function() {
      expect(saBrowser.query("input.rights-device-create:checked")).to.be(null);
      expect(saBrowser.query("input.rights-device-create")).not.to.be(null);
      expect(saBrowser.query("input.rights-device-edit:checked")).to.be(null);
      expect(saBrowser.query("input.rights-device-edit")).not.to.be(null);
      expect(saBrowser.query("input.rights-device-show:checked")).to.be(null);
      expect(saBrowser.query("input.rights-device-show")).not.to.be(null);
    });

    it("should add create device rights to user", function(done) {
      saBrowser
        .check(t('user.rights.device.create'))
        .check(t('user.rights.device.show'))
        .check(t('user.rights.device.edit'))
        .pressButton(t('action.put'))
        .then(done, done)
    });

    it("should see changes on user", function() {
      User.findById(seller._id, function(err, u) {
        if (err) throw "Some error on findById: " + err;
        expect(u.rights["Device"].indexOf("create") > -1).to.be.truthy;
        expect(u.rights["Device"].indexOf("show") > -1).to.be.truthy;
        expect(u.rights["Device"].indexOf("edit") > -1).to.be.truthy;
        seller = u;
      });
    });
/*
    it("should signout", function() {
      saBrowser
      .pressButton(t('session.sign_out'))
      .then(function() {
        expect(saBrowser.location.pathname).to.be('/signin');
        expect(saBrowser.text('title')).to.contain('Sign in');
      });
    });*/
  });

  describe("when seller accept rights", function() {
    it("should see create button", function(done) {
      selBrowser.visit("/", function() {
        expect(selBrowser.url).to.eql(url + '/#/devices');
        expect(selBrowser.query("a[href='#/devices/new']").parentNode.style.display).to.be("");
        done();
      });
    });

    it("should create device", function(done) {
      selBrowser.clickLink("a[href='#/devices/new']", function() {
        selBrowser.
          fill('name', "some new device").
          pressButton("Сохранить").
          then(done, done);
      });
    });

    it("should see device in list", function(done) {
      selBrowser.clickLink("a[href='#/devices']", function() {
        expect(selBrowser.url).to.eql(url + '/#/devices');
        expect(selBrowser.text("table tr:nth-child(2) td.tp-sender a")).to.be("some new device");
        done();
      });
    });
/*
    it("should has rights for update device", function(done) {
      selBrowser.clickLink("table tr:nth-child(2) td.tp-sender a", function() {
        selBrowser.
          fill('name', "some new device2").
          pressButton(t("action.put")).
          then(done, done);
      });
    });

    it("should see updated device in list", function(done) {
      selBrowser.clickLink("a[href='#/devices']", function() {
        expect(selBrowser.url).to.eql(url + '/#/devices');
        expect(selBrowser.text("table tr:nth-child(2) td.tp-sender a")).to.be("some new device2");
        done();
      });
    });
    */
  });

  describe("when user want to claim devices", function() {
    it("should signup", function(done) {
      userBrowser.visit('/signin').then(function() {
        userBrowser.clickLink('a[href="/signup"]').then(function() {
          userBrowser
          .fill('name', 'User')
          .fill('email', 'user@asutp.io')
          .fill('password', '123456')
          .fill('confirmation', '123456')
          .pressButton(t('session.sign_up'))
          .then(function() {
            expect(userBrowser.success).to.be(true);
            expect(userBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(userBrowser.location.pathname).to.be('/signin');
            expect(userBrowser.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
            expect(userBrowser.text('title')).to.contain('Sign in');
          })
          .then(done, done)
        });
      });
    });

    describe("follow sign in", function() {
      it("should accept credentials", function(done) {
        userBrowser
        .fill('email', 'user@asutp.io')
        .fill('password', 123456)
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(userBrowser.success).to.be(true);
          expect(userBrowser.location.pathname).to.be('/');
          expect(userBrowser.text('title')).to.contain('User');
        })
        .then(done, done);
      });

      it("should see devices pages", function() {
        expect(userBrowser.query("a[href='#/devices']")).not.to.be(null);
        expect(userBrowser.query("a[href='#/users']")).not.to.be(null);
        expect(userBrowser.query("a[href='#/sites']")).not.to.be(null);
      });

      it("shouldn't see create device", function() {
        expect(userBrowser.query("a[href='#/devices/new']").parentNode.style.display).to.be("none");
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
