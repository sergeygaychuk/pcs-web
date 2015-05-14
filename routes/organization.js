/* routes/organization.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Organization = require('../models/organization');
var auth = require('./_auth');
var per_page = 25;

var orgExportFields = '_id name owner',
    userExportFields = '_id name';

function indexOrganizations(req, res) {
  var page = Number(req.query.page) || 1;
  page--;

  if (!req.operator)
    res.send(500, 'Internal server error');

  if (page < 0)
    page = 0;
  var baseFilter = { owner: req.operator._id };
  Organization
    .find(baseFilter)
    .count(function (err, count) {
      if (err)
        return res.send(500, err.toString());
      if ((page * per_page) > count)
        page = Math.floor((count - 1) / per_page);
      Organization
        .find(baseFilter, orgExportFields)
        .populate('owner', userExportFields)
        .sort({ name: 1 })
        .skip(page*per_page)
        .limit(per_page)
        .exec(function (err, orgs) {
          if (err)
              return res.send(500, err.toString());
          orgs.push({ count: count });
          res.json_ng(orgs);
        });
    });
  }

var orgFields = ['name']

function createOrganization(req, res) {
  req.organization = new Organization();
  orgFields.forEach(function (f) {
    req.organization[f] = req.body[f];
  });
  req.organization.owner = req.operator._id;
  req.organization.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.organization);
  });
}

function loadOrganization(req, res, next, id) {
  Organization.findOne({ _id: id }, function (err, org) {
    if (err) {
      return res.send(404);
    }
    req.organization = org;
    next();
  })
}

function showOrganization(req, res) {
  if (!req.organization)
    return res.send(404);
  var organization = {};
  orgExportFields.split(' ').forEach(function (f) {
    organization[f] = req.organization[f];
  });
  res.json_ng(organization);
}

function updateOrganization(req, res) {
  if (!req.organization)
    return res.send(404);
  orgFields.forEach(function (f) {
    req.organization[f] = req.body[f];
  });
  req.organization.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    var organization = {};
    orgExportFields.split(' ').forEach(function (f) {
      organization[f] = req.organization[f];
    });
    res.json_ng(organization);
  });
}

module.exports.index = [ auth.authenticate,
                         indexOrganizations];

module.exports.create = [ auth.authenticate,
                          createOrganization];

module.exports.load = loadOrganization;

module.exports.show = [ auth.authenticate,
                        showOrganization];

module.exports.update = [ auth.authenticate,
                          updateOrganization];


// vim:ts=2 sts=2 sw=2 et:
