/* test/views/user.js -- test user pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var browser = new Browser({ site: global.url });
function t(key, options) {
  return global.i18n.t(key, options);
}

var User = require('../../models/user');
var attrs = { name: 'Example User1"', email: "user-1@example.com",
      password: 'password', confirmation: 'password' }

var update = {};

describe('User#show page', function(){
  var user;

  before(function (done) {
    user = new User(attrs);
    user.save(function () {
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), attrs.email)
        .fill(t('user.password'), attrs.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          browser.visit('/users/' + user._id.toString()).then(done, done);
        }, done);
      }, done);
    });
  });

  it('should display user', function(){
    expect(browser.statusCode).to.be(200);
    expect(browser.query("input[value='"+user.name+"']")).to.be.true;
    expect(browser.query('input[value="'+user.email+'"]')).to.be.true;
  })

  describe('edit with valid data', function () {
    before(function (done) {
      update.name = 'New Name';
      update.email = 'new@example.com';
      browser
      .fill(t('user.name'), update.name)
      .fill(t('user.email'), update.email)
      .pressButton(t('user.update'))
      .then(done, done);
    })

    it('should show updated date', function () {
      expect(browser.statusCode).to.be(200);
      expect(browser.query("input[value='"+update.name+"']")).to.be.true;
      expect(browser.query('input[value="'+update.email+'"]')).to.be.true;
    })
  })
});

// vim:ts=2 sts=2 sw=2 et:
