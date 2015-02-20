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
    seller = new Browser({ site: global.url });
  });

  describe("when seller want to create devices", function() {
    it("should signup", function(done) {
      seller.visit('/signin').then(function() {
        seller.clickLink('a[href="/signup"]').then(function() {
          seller
          .fill('name', 'Seller')
          .fill('email', 'seller@asutp.io')
          .fill('password', '123456')
          .fill('confirmation', '123456')
          .pressButton(t('session.sign_up'))
          .then(function() {
            expect(seller.success).to.be(true);
            expect(seller.queryAll('div.form-group.has-error').length).to.be(0);
            expect(seller.location.pathname).to.be('/signin');
            expect(seller.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
            expect(seller.text('title')).to.contain('Sign in');
          })
          .then(done, done)
        });
      });
    });

    describe("follow sign in", function() {
      it("should accept credentials", function(done) {
        seller
        .fill('email', 'seller@asutp.io')
        .fill('password', 123456)
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(seller.success).to.be(true);
          expect(seller.location.pathname).to.be('/');
          expect(seller.text('title')).to.contain('Seller');
        })
        .then(done, done);
      });
    });
  });

  describe('superadmin assign right to create device', function() {
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

    it("should see seller", function(done) {
      expect(saBrowser.url).to.eql(url + '/#/users');
      User.findOne({email: 'seller@asutp.io'}, function(err, u) {
        expect(err).to.be(null);
        expect(u).not.to.be(null);
        expect(saBrowser.query("table.tp-data td a[href='#/users/" + u._id + "']").textContent).to.be(u.name);
        done();
      });
    });

    it("should see initial rights for user", function() {
    });

    it("should signout", function() {
      saBrowser
      .pressButton(t('session.sign_out'))
      .then(function() {
        expect(saBrowser.location.pathname).to.be('/signin');
        expect(saBrowser.text('title')).to.contain('Sign in');
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
