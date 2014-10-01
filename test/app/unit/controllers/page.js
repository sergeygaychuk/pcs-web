'use strict'
/* test/app/unit/controllers/page.js -- test Page Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("Page Controllers", function() {
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

  describe("PageCtrl", function() {
    var scope, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {};
    }));

    it("should define pager", function() {
      controller('PageCtrl', { $scope: scope });
      expect(scope.pager).toBeDefined();
      expect(scope.pager.first).toEqual(0);
      expect(scope.pager.last).toEqual(0);
      expect(scope.pager.count).toEqual(0);
      expect(scope.pager.page).toEqual(1);
      expect(scope.pager.show).toBeFalsy();
    });

    it("should define moment", function() {
      moment = "haha"
      controller('PageCtrl', { $scope: scope });
      expect(scope.moment).toEqual("haha");
    });

    it("should define operator", function() {
      controller('PageCtrl', { $scope: scope });
      expect(scope.operator).toEqual({});
    });

    describe("#setNewURL", function() {
      it("should update newURL", function() {
        controller('PageCtrl', { $scope: scope });
        expect(scope.newURL).toBeUndefined();
        scope.setNewURL("HELLO");
        expect(scope.newURL).toEqual("HELLO");
      });
    });

    describe("#page", function() {
      beforeEach(function() {
        controller('PageCtrl', { $scope: scope });
      });

      it("should update pager count", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.count).toEqual(26);
      });

      it("should update pager page", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.page).toEqual(1);
      });

      it("should update pager first", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.first).toEqual(1);
        scope.page(2, 23, 26);
        expect(scope.pager.first).toEqual(24);
      });

      it("should update pager last", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.last).toEqual(23);
        scope.page(2, 23, 26);
        expect(scope.pager.last).toEqual(26);
      });

      describe("update show attribute", function() {
        it("should show if count is specified", function() {
          scope.page(1, 23, 26);
          expect(scope.pager.show).toBeTruthy();
        });

        it("should show if count is not specified", function() {
          scope.page(1, 23, 0);
          expect(scope.pager.show).toBeFalsy();
        });
      });

      describe("update prev attribute", function() {
        it("should set prev if page is more then 1", function() {
          location.path("/hello");
          scope.page(2, 23, 26);
          expect(scope.pager.prev).toEqual('#/hello?page=1');
        });

        it("should clear prev is page is 1", function() {
          scope.page(1, 23, 0);
          expect(scope.pager.prev).toEqual('');
        });
      });

      describe("update next attribute", function() {
        it("should set next if page is 1", function() {
          location.path("/hello");
          scope.page(1, 23, 26);
          expect(scope.pager.next).toEqual('#/hello?page=2');
        });

        it("should clear next is page is more then 1", function() {
          scope.page(2, 23, 0);
          expect(scope.pager.next).toEqual('');
        });
      });
    });
  });
});
