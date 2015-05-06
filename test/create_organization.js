/* test/create_organization.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var orgBrowser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var config = require('../config');

describe('Create organization', function () {
  before( function () {
    orgBrowser = new Browser({ site: global.url });
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

      it("shouldn't see any organizations", function(done) {
        expect(orgBrowser.query("a[href='#/organizations']").parentNode.style.display).not.to.be("none");
        orgBrowser.clickLink("a[href='#/organizations']", function() {
          expect(orgBrowser.url).to.eql(url + '/#/organizations');
          expect(orgBrowser.queryAll("table.tr").length).to.be(0);
          expect(orgBrowser.text("a[href='#/organizations/new']")).not.to.be(null);
          done();
        });
      });

      describe("when user want to create organization", function() {
        it("should see create page", function(done) {
          orgBrowser.clickLink("a[href='#/organizations/new']", function() {
            expect(orgBrowser.query("input[name='name']").value).to.eql("");
            expect(orgBrowser.query("input[name='owner']").value).to.eql("Some Cool User");
            expect(orgBrowser.text("form[name='orgForm'] > button")).to.eql("Создать");
            expect(orgBrowser.query("form[name='orgForm'] > button:disabled")).not.to.be(null);
            orgBrowser
              .fill('input[name="name"]', "Some cool organization")
              .pressButton(t('action.undefined'))
              .then(done, done)
          });
        });

        it("should see new organization in list", function() {
          expect(orgBrowser.url).to.be(url + '/#/organizations');
          var pager = orgBrowser.queryAll("div.page > b");
          expect(pager.length).to.be(3);
          expect(pager[0].textContent).to.be("1");
          expect(pager[1].textContent).to.be("1");

          var table = orgBrowser.queryAll('table.tp-data tr');
          expect(table.length).to.be(1);

          var row = orgBrowser.queryAll("td", table[1]);
          expect(orgBrowser.text(row[1])).to.be("Some cool organization");
          expect(orgBrowser.text("span", row[2])).to.be("Some Cool User");
          expect(orgBrowser.queryAll("span", row[3]).length).to.be(1);
          expect(orgBrowser.text("span", row[3])).to.be("Владелец");
        });
      });
    });
  });
});

