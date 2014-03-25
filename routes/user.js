/* routes/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var auth = require('./_auth');

module.exports.load = function (req, res, next, id) {
  User.findOne({ _id: id }, function (err, user) {
    req.user = user;
    next();
  })
}

function showUser (req, res) {
  res.render('users/show', {
    user: req.user,
    operator: req.operator,
    title: req.user.name
  })
}

var userFields = ['name', 'email'];

function updateUser (req, res) {
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  req.user.save(function (err) {
    if (err) {
      res.locals.err = err;
      if (err.errors && Object.keys(err.errors).length)
        res.locals.messages.push({ severity: 'danger', key: 'error_msg',
          options: { count: Object.keys(err.errors).length } });
      console.log(res.locals.messages);
      return showUser(req, res);
    }
    res.redirect('/users/' + req.user._id);
  });
}

module.exports.show = [ auth.authenticate,
                        showUser];

module.exports.update = [ auth.authenticate,
                          updateUser];
// vim:ts=2 sts=2 sw=2 et:
