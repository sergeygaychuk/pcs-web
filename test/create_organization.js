/* test/create_organization.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var saBrowser, orgBrowser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var config = require('../config');

describe('Create organization', function () {
  before( function () {
    saBrowser = new Browser({ site: global.url });
    orgBrowser = new Browser({ site: global.url });
  });

  describe('superadmin want to see organization list', function() {
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

    it("shouldn't see any organizations", function(done) {
      expect(saBrowser.query("a[href='#/organizations']").parentNode.style.display).not.to.be("none");
      saBrowser.clickLink("a[href='#/organizations']", function() {
        expect(saBrowser.url).to.eql(url + '/#/organizations');
        expect(saBrowser.queryAll("table.tr").length).to.be(0);
        done();
      });
    });
  });

  describe("when user want to create organization", function() {
    it("should signup", function(done) {
      orgBrowser.visit('/signin').then(function() {
        orgBrowser.clickLink('a[href="/signup"]').then(function() {
          orgBrowser
          .fill('name', 'Some Cool User')
          .fill('email', 'org.owner@asutp.io')
          .fill('password', '123456')
          .fill('confirmation', '123456')
          .pressButton(t('session.sign_up'))
          .then(function() {
            expect(orgBrowser.success).to.be(true);
            expect(orgBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(orgBrowser.location.pathname).to.be('/signin');
            expect(orgBrowser.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
            expect(orgBrowser.text('title')).to.contain('Sign in');
          })
          .then(done, done)
        });
      });
    });

    describe("follow sign in", function() {
      it("should accept credentials", function(done) {
        orgBrowser
        .fill('email', 'org.owner@asutp.io')
        .fill('password', 123456)
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(orgBrowser.success).to.be(true);
          expect(orgBrowser.location.pathname).to.be('/');
          expect(orgBrowser.text('title')).to.contain('Some Cool User');
        })
        .then(done, done);
      });

      it("shouldn't see create organization btn", function() {
        expect(orgBrowser.query("li[pcs-operator-can-list]").style.display).to.be("none");
      });
    });
  });
});

