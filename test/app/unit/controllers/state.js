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

  describe("StateCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: function() {},
        setNewURL: function() {},
        $on: function() {},
      };
      spyOn(scope, "$on");
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");
      routeParams = { deviceId: 2, stateId: 3 };
      httpBackend.expectGET('/devices/2').respond({_id: 2, name: "hello"});
      httpBackend.expectGET('/devices/2/states/3').respond({_id: 3, device: 2, stamp: new Date()});
    }));

    it("should call page with params", function() {
      controller('StateCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('StateCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should create device", function() {
      controller('StateCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.device).toBeDefined();
    });

    it("should create state", function() {
      controller('StateCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.state).toBeDefined();
    });
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

    it("should open state", function() {
      httpBackend.expectGET('/devices/2/states?page=1').respond([{_id: 1}, { count: 2 }]);
      var loc = { path: jasmine.createSpy("path"), search: function() {return {};} };
      controller('StatesCtrl', { $scope: scope, $routeParams: { deviceId: 2 }, $location: loc });
      scope.show(3);
      expect(loc.path).toHaveBeenCalledWith("/devices/2/states/3");
    });
  });
});


