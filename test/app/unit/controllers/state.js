'use strict'
/* test/app/unit/controllers/states.js -- test State angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("State Controllers", function() {
  var httpBackend;

  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  beforeEach(inject(function($httpBackend) {
    httpBackend = $httpBackend;
  }));

  afterEach(function(){
    httpBackend.verifyNoOutstandingExpectation();
  });

  describe("StatesCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: function() {},
        setNewURL: function() {},
      };
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");

      httpBackend.expectGET('/devices/2').respond({_id: 2});
    }));

    it("should call setNewURL", function() {
      httpBackend.expectGET('/devices/2/states?page=1').respond([]);
      controller('StatesCtrl', { $scope: scope, $routeParams: { deviceId: 2 } });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should call page after load devices", function() {
      httpBackend.expectGET('/devices/2/states?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('StatesCtrl', { $scope: scope, $routeParams: { deviceId: 2 } });
      httpBackend.flush();
      expect(scope.page).toHaveBeenCalledWith(1, 25, 2);
    });

    it("should fill devices", function() {
      httpBackend.expectGET('/devices/2/states?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('StatesCtrl', { $scope: scope, $routeParams: { deviceId: 2 } });
      httpBackend.flush();
      expect(scope.states.length).toEqual(1);
      expect(scope.states[0]._id).toEqual(1);
    });

    it("should use page from query params", function() {
      location.search({page: 2});
      httpBackend.expectGET('/devices/2/states?page=2').respond([{_id: 1}, { count: 2 }]);
      controller('StatesCtrl', { $scope: scope, $routeParams: { deviceId: 2 } });
    });
  });
});


