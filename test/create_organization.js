/* test/create_organization.js
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

var config = require('../config');

describe('Create organization', function () {
  before( function () {
    saBrowser = new Browser({ site: global.url });
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
            expect(saBrowser.text('title')).to.contain(t("user.root"));
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
});

