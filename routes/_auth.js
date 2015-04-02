/* routes/_auth.js -- authentication middleware
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var Superadmin = require('../models/superadmin');

module.exports.authenticate = function (req, res, next) {
  if (!req.session.operatorId) {
    req.session.returnTo = req.url;
    return res.redirect('/signin');
  }

  Superadmin.findById(req.session.operatorId, function(err, user) {
    if (user) {
      res.locals.operator = req.operator = user;
      next();
      return;
    }
    User.findOne({ _id: req.session.operatorId }, function (err, user) {
      if (err)
        return res.send(500, 'Sorry, internal server error.');

      if (!user)
        return res.redirect('/signin');

      res.locals.operator = req.operator = user;
      next();
    });
  });
}

module.exports.requireAdmin = function (req, res, next) {
  if (!req.operator)
    return res.send(401);
  if (req.operator.admin || req.operator.superadmin)
    return next();
  res.send(403);
}

module.exports.canAccessFor = function (klass, action, req, res, next) {
  if (!req.operator)
    return res.send(401);
  req.operator.can(action, klass, function(accessed) {
    console.error(action, klass, accessed);
    if (accessed)
      return next();
    res.send(403);
  });
}

// vim:ts=2 sts=2 sw=2 et:
