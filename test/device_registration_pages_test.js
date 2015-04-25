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
var Device = require('../models/device');
var Right = require('../models/right');
var config = require('../config');

describe('Registartion of device', function () {
  before( function (done) {
    saBrowser = new Browser({ site: global.url });
    selBrowser = new Browser({ site: global.url });
    userBrowser = new Browser({ site: global.url });
    otherUserBrowser = new Browser({ site: global.url });


    var manageDevices = {
      name: "Manage devices",
      autoAssigned: false,
      abilities: {
        "Device": ["create", "show", "index", "update"]
      }
    };

    (new Right(manageDevices)).save(function(err) {
      if (err) throw err;
      done();
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

  var seller = null;
  describe('superadmin assign right to create device', function() {

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

    it("should add create device rights to user", function(done) {
      expect(saBrowser.query("div.modal")).to.be(null);
      expect(saBrowser.text("div.row > div.tp-data > div > button.btn-success")).to.eql("Добавить");
      expect(saBrowser.query("div.row > div.tp-data > div > button.btn-success:disabled")).to.be(null);
      saBrowser.
        pressButton("div.row > div.tp-data > div > button.btn-success").
        then(function() {
          expect(saBrowser.text("div.modal h3.modal-title")).to.eql("Выбор правил");
          var rights = saBrowser.queryAll("div.modal div.modal-body table tr");
          expect(rights.length).to.eql(1);
          expect(saBrowser.text(saBrowser.queryAll("td", rights[0])[1])).to.eql("Manage devices");
          saBrowser.check("div.modal div.modal-body table tr:nth-child(1) input");
          expect(saBrowser.text("div.modal div.modal-footer button.btn-primary")).to.eql("Применить");
          saBrowser.
            pressButton("div.modal div.modal-footer button.btn-primary").
            then(function() {
              var rights = saBrowser.queryAll("div.row div.tp-data table tr");
              expect(rights.length).to.be(3);
              var rightsTexts = [
                saBrowser.text(saBrowser.queryAll("td", rights[0])[1]),
                saBrowser.text(saBrowser.queryAll("td", rights[1])[1]),
                saBrowser.text(saBrowser.queryAll("td", rights[2])[1])
              ];
              expect(rightsTexts).to.eql(['Claim device', 'Profile access', 'Manage devices']);
              saBrowser.pressButton(t('action.put')).then(done, done);
            });
        });
    });

    it("should save data to db", function(done) {
      User.findById(seller._id, function(err, u) {
        if (err) throw "Some error on findById: " + err;
        u.populate("rights", function(err, user) {
          if (err) throw "Some error on findById: " + err;
          var names = user.rights.map(function(right) {
            return right.name;
          });
          expect(names).to.eql(['Claim device', 'Profile access', 'Manage devices']);
          seller = user;
          done();
        });
      });
    });
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
          fill('sn', "12245621223554225").
          pressButton("Сохранить").
          then(done, done);
      });
    });

    it("should see device in list", function(done) {
      selBrowser.clickLink("a[href='#/devices']", function() {
        expect(selBrowser.url).to.eql(url + '/#/devices');
        expect(selBrowser.text("table tr:nth-child(1) td.tp-sender a")).to.be("some new device");
        expect(selBrowser.text("table tr:nth-child(1) td span")).to.be("12245621223554225");
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

      it("shouldn't see devices", function() {
        expect(userBrowser.queryAll("table.tp-data tr").length).to.be(0);
      });

      it("shouldn't see create device", function() {
        expect(userBrowser.query("a[href='#/devices/new']").parentNode.style.display).to.be("none");
      });

      it("should see claim device", function() {
        expect(userBrowser.query("a[href='#/devices/claim']").parentNode.style.display).not.to.be("none");
      });

      it("should claim device", function(done) {
        userBrowser.clickLink("a[href='#/devices/claim']", function() {
          Device.find({sn: '12245621223554225'}).exec(function(err, devices) {
            expect(err).to.be(null);
            expect(devices.length).to.eql(1);
            userBrowser
            .fill('sn', '12245621223554225')
            .pressButton("Закрепить")
            .then(function() {
              expect(userBrowser.success).to.be(true);
              expect(userBrowser.location.hash).to.be('#/devices/' + devices[0]._id);
              expect(userBrowser.query("input[name='name']").value).to.eql(devices[0].name);
              expect(userBrowser.query("input[name='sn']").value).to.eql(devices[0].sn);
            })
            .then(done, done);
          });
        });
      });

      it("should see device in list", function(done) {
        userBrowser.clickLink("a[href='#/devices']", function() {
          expect(userBrowser.url).to.eql(url + '/#/devices');
          expect(userBrowser.text("table tr:nth-child(1) td.tp-sender a")).to.be("some new device");
          expect(userBrowser.text("table tr:nth-child(1) td span")).to.be("12245621223554225");
          done();
        });
      });
    });
  });

  describe("after claim device", function() {
    it("seller should not see device", function(done) {
      selBrowser.location.reload();
      selBrowser.clickLink("a[href='#/devices']", function() {
        expect(selBrowser.url).to.eql(url + '/#/devices');
        expect(selBrowser.queryAll("table tr").length).to.be(0);
        done();
      });
    });
  });

  describe("when other user want to claim devices", function() {
    it("should signup", function(done) {
      otherUserBrowser.visit('/signin').then(function() {
        otherUserBrowser.clickLink('a[href="/signup"]').then(function() {
          otherUserBrowser
          .fill('name', 'User2')
          .fill('email', 'user2@asutp.io')
          .fill('password', '123456')
          .fill('confirmation', '123456')
          .pressButton(t('session.sign_up'))
          .then(function() {
            expect(otherUserBrowser.success).to.be(true);
            expect(otherUserBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(otherUserBrowser.location.pathname).to.be('/signin');
            expect(otherUserBrowser.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
            expect(otherUserBrowser.text('title')).to.contain('Sign in');
          })
          .then(done, done)
        });
      });
    });

    describe("follow sign in", function() {
      it("should accept credentials", function(done) {
        otherUserBrowser
        .fill('email', 'user2@asutp.io')
        .fill('password', 123456)
        .pressButton(t('session.sign_in'))
        .then(function() {
          expect(otherUserBrowser.success).to.be(true);
          expect(otherUserBrowser.location.pathname).to.be('/');
          expect(otherUserBrowser.text('title')).to.contain('User2');
        })
        .then(done, done);
      });

      it("should see devices pages", function() {
        expect(otherUserBrowser.query("a[href='#/devices']")).not.to.be(null);
        expect(otherUserBrowser.query("a[href='#/users']")).not.to.be(null);
        expect(otherUserBrowser.query("a[href='#/sites']")).not.to.be(null);
      });

      it("shouldn't see devices", function() {
        expect(otherUserBrowser.queryAll("table.tp-data tr").length).to.be(0);
      });

      it("shouldn't see create device", function() {
        expect(otherUserBrowser.query("a[href='#/devices/new']").parentNode.style.display).to.be("none");
      });

      it("should see claim device", function() {
        expect(otherUserBrowser.query("a[href='#/devices/claim']").parentNode.style.display).not.to.be("none");
      });

      it("shouldn't claim device", function(done) {
        otherUserBrowser.clickLink("a[href='#/devices/claim']", function() {
          Device.find({sn: '12245621223554225'}).exec(function(err, devices) {
            expect(err).to.be(null);
            expect(devices.length).to.eql(1);
            otherUserBrowser
            .fill('sn', '12245621223554225')
            .pressButton("Закрепить")
            .then(function() {}, function() {
              expect(otherUserBrowser.success).to.be(true);
              expect(otherUserBrowser.location.hash).to.be('#/devices/claim');
              done();
            });
          });
        });
      });

      it("shouldn't see device in list", function(done) {
        otherUserBrowser.clickLink("a[href='#/devices']", function() {
          expect(otherUserBrowser.url).to.eql(url + '/#/devices');
          expect(otherUserBrowser.queryAll("table tr").length).to.be(0);
          done();
        });
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
