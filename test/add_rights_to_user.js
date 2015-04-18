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
  });

  describe('superadmin want to create default rights', function() {
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

    it("shouldn't see any rights", function(done) {
      expect(saBrowser.query("a[href='#/rights']").parentNode.style.display).not.to.be("none");
      saBrowser.clickLink("a[href='#/rights']", function() {
        expect(saBrowser.url).to.eql(url + '/#/rights');
        expect(saBrowser.queryAll("table.tr").length).to.be(0);
        done();
      });
    });

    describe("when want to create default rights", function() {
      it("should create default rights for view profile", function(done) {
        expect(saBrowser.url).to.eql(url + '/#/rights');
        saBrowser.clickLink("a[href='#/rights/new']", function() {
          expect(saBrowser.location.hash).to.be('#/rights/new');
          saBrowser
          .fill('name', 'Profile access')
          .check('autoAssigned')
          .check('.rights-user-show')
          .pressButton('Создать')
          .then(done, done)
        });
      });

      it("should create default rights for claim devices", function(done) {
        saBrowser.clickLink("a[href='#/rights/new']", function() {
          expect(saBrowser.location.hash).to.be('#/rights/new');
          saBrowser
          .fill('name', 'Claim device')
          .check('autoAssigned')
          .check('.rights-device-claim')
          .check('.rights-device-show')
          .check('.rights-device-index')
          .pressButton('Создать')
          .then(done, done)
        });
      });
    });

    describe("when want to create none default rights", function() {
      it("should create rights for manage devices", function(done) {
        saBrowser.clickLink("a[href='#/rights/new']", function() {
          expect(saBrowser.location.hash).to.be('#/rights/new');
          saBrowser
          .fill('name', 'Manage devices')
          .check('.rights-device-create')
          .check('.rights-device-update')
          .check('.rights-device-show')
          .check('.rights-device-index')
          .pressButton('Создать')
          .then(done, done)
        });
      });
    });
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
  });

});
// vim:ts=2 sts=2 sw=2 et:
