/* routes/right.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Right = require('../models/right');
var auth = require('./_auth');
var per_page = 25;

module.exports.load = function (req, res, next, id) {
  Right.findOne({ _id: id }, function (err, right) {
    if (err || !right)
      return res.send(404);
    req.right = right;
    next();
  })
}

function requireSuperadmin(req, res, next) {
  if (req.operator.superadmin)
    return next();
  res.send(403);
}


var exportFields = '_id name abilities';

function showRight(req, res) {
  if (!req.right)
    return res.send(404);
  var right = {};
  exportFields.split(' ').forEach(function (f) {
    right[f] = req.right[f];
  });
  res.json_ng(right);
}

var rightUpdateFields = ['name', 'abilities'];

function updateRight(req, res) {
  if (!req.right)
    return res.send(404);
  rightUpdateFields.forEach(function (f) {
    req.right[f] = req.body[f];
  });
  req.right.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.right);
  });
}

function indexRights(req, res) {
  var page = Number(req.query.page) || 1;
  page--;
  if (page < 0)
    page = 0;
  Right.count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * per_page) > count)
      page = Math.floor((count - 1) / per_page);
    Right
    .find({}, exportFields).sort({ name: 1 }).skip(page*per_page).limit(per_page)
    .exec(function (err, rights) {
      if (err)
        return res.send(500, err.toString());
      rights.push({ count: count });
      res.json_ng(rights);
    });
  });
}

var rightFields = rightUpdateFields;

function createRight(req, res) {
  req.right = new Right();
  rightFields.forEach(function (f) {
    req.right[f] = req.body[f];
  });
  req.right.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.right);
  });
}

module.exports.show = [ auth.authenticate,
                        requireSuperadmin,
                        showRight];

module.exports.update = [ auth.authenticate,
                          requireSuperadmin,
                          updateRight];

module.exports.index = [ auth.authenticate,
                         requireSuperadmin,
                         indexRights];

module.exports.create = [ auth.authenticate,
                          requireSuperadmin,
                          createRight];

// vim:ts=2 sts=2 sw=2 et:
