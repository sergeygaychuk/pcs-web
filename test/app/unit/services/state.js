'use strict'
/* test/app/unit/services/state.js -- test State Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("State Service", function() {
  var service, ret;

  beforeEach(function() {

    var aClass = function() {
    };
    ret = new aClass();
    ret.prototype = {};

    service = {};
    service.resource = function() { };
    spyOn(service, 'resource').andReturn(ret);
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', service.resource);
    });
  });

  it("should create resource", function() {
    inject(function(State) {
      expect(service.resource).toHaveBeenCalledWith('/devices/:deviceId/states/:stateId', { deviceId: '@device', stateId: '@_id' });
    });
  });

  it("should add toString method", function() {
    inject(function(State) {
      var data = { outputs: { m1: 222, j: 33 } };
      expect(ret.prototype.toString.call(data)).toEqual("m1: 222, j: 33");
    });
  });
});



