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

  describe("when user want to create organization", function() {
    it("he should stay on profile page", function() {
      expect(browser.location.hash).to.eql('#/users/' + user._id + '?page=2');
    });

    it("he should see create btn", function() {
      expect(browser.text("button.orgs-create-btn")).to.eql('Создать организацию');
    });

    describe("and press create btn", function() {
      before(function(done) {
        browser.pressButton("button.orgs-create-btn", done);
      });

      it("he should see creation page", function() {
        expect(browser.location.hash).to.eql('#/users/' + user._id + '/organizations/new');
        expect(browser.query("input[name='name']").value).to.eql('');
        expect(browser.query("input[name='owner']").value).to.eql(user.name);
        expect(browser.query("input[name='owner']:disabled")).not.to.be(null);
        expect(browser.text("form[name='organizationForm'] > button")).to.eql("Создать");
        expect(browser.query("form[name='organizationForm'] > button:disabled")).not.to.be(null);
      });

      it("he should be available to create organization", function(done) {
        browser
          .fill("input[name='name']", "arganizacija")
          .pressButton("form[name='organizationForm'] > button")
          .then(done, done);
      });

      it("he should return to edit page", function(done) {
        Organization.find({owner: user._id, name: 'arganizacija'}).exec(function (err, orgs) {
          expect(err).to.be(null);
          expect(orgs.length).to.eql(1);
          expect(browser.location.hash).to.eql('#/users/' + user._id + '/organizations/' + orgs[0]._id);
          expect(browser.query("input[name='name']").value).to.eql('arganizacija');
          expect(browser.query("input[name='owner']").value).to.eql(user.name);
          done();
        });
      });
    });
  });

  describe("when user want to edit organizations", function() {
    var organization = null;
    var orgUrl = null;

    before(function(done) {
      Organization.find({owner: user._id, name: 'arganizacija'}).exec(function (err, orgs) {
        if (err) throw err;
        if (orgs.length !== 1) throw "Invalid";
        organization = orgs[0];
        orgUrl = "#/users/" + user._id + "/organizations/" + organization._id;
        done();
      });
    });

    it("he should go to user profile page", function(done) {
      browser.clickLink('nav a.dropdown-toggle').then(function () {
        browser.clickLink('nav ul.dropdown-menu a').then(done, done);
      }, done);
    });

    it("he should see organization in list", function() {
      expect(browser.text('table.tp-data tr td a[href="' + orgUrl +'"]')).to.eql(organization.name);
    });

    it("he should go to edit page", function(done) {
      browser.clickLink('table.tp-data tr td a[href="' + orgUrl +'"]').then(function() {
        expect(browser.location.hash).to.eql(orgUrl);
        expect(browser.query("input[name='name']").value).to.eql('arganizacija');
        expect(browser.query("input[name='owner']").value).to.eql(user.name);
        expect(browser.query("input[name='owner']:disabled")).not.to.be(null);
        expect(browser.text("form[name='organizationForm'] > button")).to.eql("Изменить");
        expect(browser.query("form[name='organizationForm'] > button:disabled")).not.to.be(null);
        done();
      }, done);
    });

    it("he should update organization name", function(done) {
      browser
        .fill("input[name='name']", "arganizacija222")
        .pressButton("form[name='organizationForm'] > button")
        .then(done, done);
    });

    it("he should go to user profile page", function(done) {
      browser.clickLink('nav a.dropdown-toggle').then(function () {
        browser.clickLink('nav ul.dropdown-menu a').then(done, done);
      }, done);
    });

    it("he should see changed name in list", function() {
      expect(browser.text('table.tp-data tr td a[href="' + orgUrl +'"]')).to.eql('arganizacija222');
    });
  });

  describe("when user want to remove organizations", function() {
    it("he should go to user profile page", function(done) {
      browser.clickLink('nav a.dropdown-toggle').then(function () {
        browser.clickLink('nav ul.dropdown-menu a').then(done, done);
      }, done);
    });

    it("he should see remove btn", function() {
      expect(browser.text("button.orgs-remove-btn")).to.eql('Удалить организации');
      expect(browser.query("button.orgs-remove-btn:disabled")).not.to.be(null);
    });

    it("he should has possibility to select organizations", function() {
      browser.check("table tr:nth-child(1) td input[type='checkbox']");
      expect(browser.query("button.orgs-remove-btn:disabled")).to.be(null);
      browser.check("table tr:nth-child(2) td input[type='checkbox']");
    });

    it("he should remove organizations and see updated data", function(done) {
      browser.pressButton("button.orgs-remove-btn").then(function() {
        expect(browser.queryAll("table tr").length).to.eql(25);
        var pager = browser.queryAll("div.page.orgs-pager > b");
        expect(pager.length).to.be(3);
        expect(pager[0].textContent).to.be("1");
        expect(pager[1].textContent).to.be("25");
        expect(pager[2].textContent).to.be("29");
        done();
      }, done);
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

