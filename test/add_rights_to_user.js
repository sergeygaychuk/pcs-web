/* test/add_rights_to_user.js -- test add rights to user, run it with mocha
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

      it("shouldn't see any devices", function() {
        expect(selBrowser.queryAll("table.tp-data tr").length).to.be(0);
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

    it("should see seller", function(done) {
      saBrowser.clickLink("a[href='#/users']", function() {
        expect(saBrowser.url).to.eql(url + '/#/users');
        expect(seller).not.to.be(null);
        expect(saBrowser.query("table.tp-data td a[href='#/users/" + seller._id + "']").textContent).to.be(seller.name);
        done();
      });
    });

    it("should see initial rights for user", function(done) {
      expect(saBrowser.url).to.eql(url + '/#/users');
      saBrowser.clickLink("table.tp-data td a[href='#/users/" + seller._id + "']", function() {
        expect(saBrowser.location.hash).to.be('#/users/' + seller._id);
        expect(saBrowser.query("input[name='email']").value).to.eql(seller.email);
        expect(saBrowser.text("form[name='userForm'] > button")).to.eql("Изменить");
        expect(saBrowser.query("form[name='userForm'] > button:disabled")).not.to.be(null);
        var rights = saBrowser.queryAll("div.row div.tp-data table tr");
        expect(rights.length).to.be(2);
        var rightsTexts = [
          saBrowser.text(saBrowser.queryAll("td", rights[0])[1]),
          saBrowser.text(saBrowser.queryAll("td", rights[1])[1])
        ];
        expect(rightsTexts).to.eql(['Claim device', 'Profile access']);
        done();
      });
    });

    it("should allow to remove rights", function(done) {
      expect(saBrowser.text("div.row > div.tp-data > div > button.btn-danger")).to.eql("Удалить");
      expect(saBrowser.query("div.row > div.tp-data > div > button.btn-danger:disabled")).not.to.be(null);
      saBrowser.check("div.row div.tp-data table tr:nth-child(1) td:nth-child(1) input");
      expect(saBrowser.query("div.row > div.tp-data > div > button.btn-danger:disabled")).to.be(null);
      saBrowser.
        pressButton("div.row > div.tp-data > div > button.btn-danger").
        then(function() {
          var rights = saBrowser.queryAll("div.row div.tp-data table tr");
          expect(rights.length).to.be(1);
          var rightsTexts = [
            saBrowser.text(saBrowser.queryAll("td", rights[0])[1])
          ];
          expect(rightsTexts).to.eql(['Profile access']);
          done();
        });
    });

    it("should not change rights if called cancel", function(done) {
      expect(saBrowser.text("div.row > div.tp-data > div > button.btn-success")).to.eql("Добавить");
      expect(saBrowser.query("div.row > div.tp-data > div > button.btn-success:disabled")).to.be(null);
      saBrowser.
        pressButton("div.row > div.tp-data > div > button.btn-success").
        then(function() {
          expect(saBrowser.text("div.modal h3.modal-title")).to.eql("Выбор правил");
          var rights = saBrowser.queryAll("div.modal div.modal-body table tr");
          expect(rights.length).to.eql(2);
          expect(saBrowser.text("div.modal div.modal-footer button.btn-warning")).to.eql("Отменить");
          saBrowser.
            pressButton("div.modal div.modal-footer button.btn-warning").
            then(function() {
              var rights = saBrowser.queryAll("div.row div.tp-data table tr");
              expect(rights.length).to.be(1);
              var rightsTexts = [
                saBrowser.text(saBrowser.queryAll("td", rights[0])[1])
              ];
              expect(rightsTexts).to.eql(['Profile access']);
              expect(saBrowser.query("div.modal")).to.be(null);
              done();
            });
        });
    });

    it("should change rights if called save", function(done) {
      expect(saBrowser.query("div.modal")).to.be(null);
      expect(saBrowser.text("div.row > div.tp-data > div > button.btn-success")).to.eql("Добавить");
      expect(saBrowser.query("div.row > div.tp-data > div > button.btn-success:disabled")).to.be(null);
      saBrowser.
        pressButton("div.row > div.tp-data > div > button.btn-success").
        then(function() {
          expect(saBrowser.text("div.modal h3.modal-title")).to.eql("Выбор правил");
          var rights = saBrowser.queryAll("div.modal div.modal-body table tr");
          expect(rights.length).to.eql(2);
          expect(saBrowser.text(saBrowser.queryAll("td", rights[1])[1])).to.eql("Manage devices");
          saBrowser.check("div.modal div.modal-body table tr:nth-child(2) input");
          expect(saBrowser.text("div.modal div.modal-footer button.btn-primary")).to.eql("Применить");
          saBrowser.
            pressButton("div.modal div.modal-footer button.btn-primary").
            then(function() {
              var rights = saBrowser.queryAll("div.row div.tp-data table tr");
              expect(rights.length).to.be(2);
              var rightsTexts = [
                saBrowser.text(saBrowser.queryAll("td", rights[0])[1]),
                saBrowser.text(saBrowser.queryAll("td", rights[1])[1])
              ];
              expect(rightsTexts).to.eql(['Profile access', 'Manage devices']);
              done();
            });
        });
    });

    it("should save data", function(done) {
      expect(saBrowser.text("form[name='userForm'] > button")).to.eql("Изменить");
      expect(saBrowser.query("form[name='userForm'] > button:disabled")).to.be(null);
      saBrowser
        .pressButton(t('action.put'))
        .then(done, done)
    });

    it("should save data to db", function(done) {
      User.findById(seller._id, function(err, u) {
        if (err) throw "Some error on findById: " + err;
        u.populate("rights", function(err, user) {
          if (err) throw "Some error on findById: " + err;
          var names = user.rights.map(function(right) {
            return right.name;
          });
          expect(names).to.eql(['Profile access', 'Manage devices']);
          seller = user;
          done();
        });
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
