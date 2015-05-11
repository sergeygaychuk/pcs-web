/* test/manage_owned_organizations.js -- test organization pages, run it with mocha
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');
var Organization = require('../models/organization');

var browser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var config = require('../config');

describe('For manage owned organization', function () {
  var user;
  before( function () {
    browser = new Browser({ site: global.url });
  });

  before(function(done) {
    Factory.create('user', function (u) { user = u; done(); });
  });

  describe("user", function() {
    it('should be signed', function (done) {
      browser.visit('/signin').then(function() {
        browser
        .fill(t('user.email'), user.email)
        .fill(t('user.password'), "password")
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(browser.success).to.be(true);
          expect(browser.queryAll('div.form-group.has-error').length).to.be(0);
          expect(browser.location.pathname).to.be('/');
          expect(browser.text('title')).to.contain(user.name);
          done();
        });
      });
    });
  });

  describe('when user want to see accessed organizations', function() {
    before(function(done) {
      Factory.create("organization", { owner: user._id }, 30, function(orgs) {
        done();
      });
    });

    it("user should go to user profile page", function(done) {
      browser.clickLink('nav a.dropdown-toggle').then(function () {
        browser.clickLink('nav ul.dropdown-menu a').then(done, done);
      }, done);
    });

    it("user should see section headers", function() {
      expect(browser.text('h3.profile-header')).to.contain('Основные');
      expect(browser.text('h3.profile-header')).to.contain('Организации');
    });

    it("user should see first page of organizations", function(done) {
      var pager = browser.queryAll("div.page.orgs-pager > b");
      var table = browser.queryAll('table.tp-data tr');

      expect(pager.length).to.be(3);
      expect(pager[0].textContent).to.be("1");
      expect(pager[1].textContent).to.be("25");

      expect(table.length).to.be(25);

      Organization.find({owner: user._id}).count(function (err, count) {
        expect(pager[2].textContent).to.eql(count);
        Organization.find({owner: user._id}).sort({ name: 1 }).limit(25).exec(function (err, orgs) {
          var i;
          for (i in orgs) {
            var o = orgs[i];
            var row = browser.queryAll("td", table[i]);
            expect(row[1].textContent).to.contain(o.name);
            expect(browser.query("span", row[2]).textContent).to.be(user.name);
            expect(browser.queryAll("span", row[3]).length).to.be(1);
            expect(browser.text("span", row[3])).to.be("Администратор");
          }
          done();
        })
      })
    });

    it("user should see second page of organizations", function(done) {
      browser.clickLink("div.page.orgs-pager > ul > li > a[href='" + browser.location.hash + "?page=2']", function() {
        var pager = browser.queryAll("div.page.orgs-pager > b");
        var table = browser.queryAll('table.tp-data tr');

        expect(pager.length).to.be(3);
        expect(pager[0].textContent).to.be("26");
        expect(pager[1].textContent).to.be("30");

        expect(table.length).to.be(5);

        Organization.find({owner: user._id}).sort({ name: 1 }).limit(25).skip(25).exec(function (err, orgs) {
          var i;
          for (i in orgs) {
            var o = orgs[i];
            var row = browser.queryAll("td", table[i]);
            expect(row[1].textContent).to.contain(o.name);
            expect(browser.query("span", row[2]).textContent).to.be(user.name);
            expect(browser.queryAll("span", row[3]).length).to.be(1);
            expect(browser.text("span", row[3])).to.be("Администратор");
          }
          done();
        })
      });
    });
  });


  describe("user", function() {
    it("should signout afterward", function() {
      browser
      .pressButton(t('session.sign_out'))
      .then(function() {
        expect(browser.location.pathname).to.be('/signin');
        expect(browser.text('title')).to.contain('Sign in');
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:

