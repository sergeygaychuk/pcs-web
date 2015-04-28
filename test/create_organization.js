/* test/create_organization.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');
var User = require('../models/user');

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

      it("shouldn't see organizations list", function() {
        expect(orgBrowser.query("a[href='#/organizations']").parentNode.style.display).to.be("none");
      });
    });
  });

  describe('superadmin want to create organization management rights', function() {
    it("should got to rights page", function(done) {
      saBrowser.clickLink("a[href='#/rights']", done);
    });

    describe("when want to create none default rights", function() {
      it("should create rights for manage organization", function(done) {
        saBrowser.clickLink("a[href='#/rights/new']", function() {
          expect(saBrowser.location.hash).to.be('#/rights/new');
          saBrowser
          .fill('name', 'Manage organization')
          .check('.rights-organization-create')
          .check('.rights-organization-update')
          .check('.rights-organization-show')
          .check('.rights-organization-index')
          .pressButton('Создать')
          .then(done, done)
        });
      });
    });
  });

  describe('superadmin assign right to create device', function() {
    var orgUser = null;

    before(function(done) {
      User.findOne({email: 'org.owner@asutp.io'}, function(err, u) {
        if (err) throw "Cann't find some cool user";
        orgUser = u;
        done();
      });
    });

    it("should see user", function(done) {
      saBrowser.clickLink("a[href='#/users']", function() {
        expect(saBrowser.url).to.eql(url + '/#/users');
        expect(orgUser).not.to.be(null);
        expect(saBrowser.query("table.tp-data td a[href='#/users/" + orgUser._id + "']").textContent).to.be(orgUser.name);
        saBrowser.clickLink("table.tp-data td a[href='#/users/" + orgUser._id + "']", done);
      });
    });

    it("want to add manage organization", function(done) {
      saBrowser.
        pressButton("div.row > div.tp-data > div > button.btn-success").
        then(function() {
          var rights = saBrowser.queryAll("div.modal div.modal-body table tr");
          expect(saBrowser.text(saBrowser.queryAll("td", rights[0])[1])).to.eql("Manage organization");
          saBrowser.check("div.modal div.modal-body table tr:nth-child(1) input");
          saBrowser.
            pressButton("div.modal div.modal-footer button.btn-primary").
            then(function() {
              var rights = saBrowser.queryAll("div.row div.tp-data table tr");
              expect(rights.length).to.be(3);
              expect(saBrowser.text("form[name='userForm'] > button")).to.eql("Изменить");
              expect(saBrowser.query("form[name='userForm'] > button:disabled")).to.be(null);
              saBrowser
                .pressButton(t('action.put'))
                .then(done, done)
            });
        });
    });
  });

  describe("when user reload page", function() {
    it("should see organizations list", function(done) {
      orgBrowser.visit("/", function() {
        expect(orgBrowser.query("a[href='#/organizations']").parentNode.style.display).to.be("");
        done();
      });
    });

    it("should not see any organizations", function(done) {
      orgBrowser.clickLink("a[href='#/organizations']", function() {
        expect(orgBrowser.url).to.eql(url + '/#/organizations');
        expect(orgBrowser.queryAll('table tr').length).to.eql(0);
        done();
      });
    });
  });
});

