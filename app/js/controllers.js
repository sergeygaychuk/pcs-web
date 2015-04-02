/* app/js/controllers.js -- application controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

'use strict';

angular.module('pcs.controllers', [])
  .controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === '#' + $location.path();
    }
  }])
  .controller('PageCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.pager = {
      first: 0,
      last: 0,
      count: 0,
      page: 1,
      show: false
    }
    $scope.moment = moment;
    $scope.operator = {
      can: function(access, klass) {
        if ($scope.operator.superadmin) {
          return true;
        }
        return false;
      },
    };
    $scope.createActions = [];
    $scope.singleBtnMode = function() {
      return $scope.createActions.length === 1;
    };
    $scope.multiBtnMode = function() {
      return $scope.createActions.length > 1;
    };
    $scope.setKlass = function(klass) {
      $scope.klass = klass;
    };
    $scope.clearCreateActions = function() {
      $scope.createActions = [];
    };
    $scope.addCreateAction = function(name, url, action) {
      $scope.createActions.push({
        name: name, url: url, action: action
      });
    };
    $scope.page = function (page, perPage, count) {
      $scope.pager.count = count;
      if (count) {
        $scope.pager.show = true;
      } else {
        $scope.pager.show = false;
      }
      $scope.pager.page = page;
      $scope.pager.first = (page - 1) * perPage + 1;
      $scope.pager.last = page * perPage;
      if (page > 1) {
        $scope.pager.prev = '#' + $location.path() + '?page=' + (page - 1);
      } else {
        $scope.pager.prev = '';
      }
      if ($scope.pager.last >= $scope.pager.count) {
        $scope.pager.last = $scope.pager.count;
        $scope.pager.next = '';
      } else {
        $scope.pager.next = '#' + $location.path() + '?page=' + (page + 1);
      }
    }
  }])
  .controller('AccessController', ['$scope', '$location', function($scope, $location) {
    if ($scope.operator) {
      if ($scope.operator.can("index", "User")) {
        $location.path('/users');
      } else if ($scope.operator.can("index", "Site")) {
        $location.path('/sites');
      } else if ($scope.operator.can("index", "Device")) {
        $location.path('/devices');
      }
    }
  }])
  .controller('ClaimDeviceCtrl', ['$scope', '$location', 'Device',
      function($scope, $location, Device) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Device");
        $scope.device = new Device();
        $scope.save = function () {
          $scope.device.$claim({}, function () {
            $location.path('/devices/' + $scope.device._id).replace();
          }, function (res) {
            //console.log(res);
          });
        }
  }])
  .controller('NewDeviceCtrl', ['$scope', '$location', 'Device',
      function($scope, $location, Device) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Device");
        $scope.device = new Device();
        $scope.save = function () {
          $scope.device.$save({}, function () {
            $scope.deviceForm.$setPristine();
            $location.path('/devices/' + $scope.device._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('DeviceCtrl', ['$scope', '$routeParams', 'Device', 'State',
      'Setpoints', 'DeviceHelper',
      function($scope, $routeParams, Device, State, Setpoints, DeviceHelper) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Device");
        $scope.addCreateAction('Create', '#/devices/new', 'create');
        $scope.addCreateAction('Claim', '#/devices/claim', 'claim');
        $scope.device = Device.get({ deviceId: $routeParams.deviceId }, function () {
        });
        $scope.setpoints = Setpoints.get({ deviceId: $routeParams.deviceId }, function () {
        });
        DeviceHelper.loadDeviceState($scope, $routeParams.deviceId);
        $scope.save = function () {
          $scope.device.$save({}, function () {
            $scope.deviceForm.$setPristine();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('DevicesCtrl', ['$scope', '$location', 'Device',
      function($scope, $location, Device) {
        var page = Number($location.search().page) || 1;
        $scope.clearCreateActions();
        $scope.setKlass("Device");
        $scope.addCreateAction('Create', '#/devices/new', 'create');
        $scope.addCreateAction('Claim', '#/devices/claim', 'claim');
        $scope.devices = Device.query({page: page}, function () {
          var len = $scope.devices.length - 1;
          var count = $scope.devices.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }])
  .controller('NewSiteCtrl', ['$scope', '$location', 'Site',
      function($scope, $location, Site) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Site");
        $scope.site = new Site();
        $scope.save = function () {
          $scope.site.$save({}, function () {
            $scope.siteForm.$setPristine();
            $location.path('/sites/' + $scope.site._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('SiteCtrl', ['$scope', '$routeParams', 'Site', 'System',
      function($scope, $routeParams, Site, System) {
        var page = Number($routeParams.page) || 1;
        $scope.clearCreateActions();
        $scope.setKlass("System");
        $scope.addCreateAction('Create', '#/sites/' + $routeParams.siteId + '/systems/new', 'create');
        $scope.site = Site.get({ siteId: $routeParams.siteId }, function () {
        });
        $scope.systems = System.query({siteId: $routeParams.siteId,
          page: page}, function () {
            var len = $scope.systems.length - 1;
            var count = $scope.systems.splice(len)[0].count;
            $scope.page(page, 25, count);
        });
        $scope.save = function () {
          $scope.site.$save({}, function () {
            $scope.siteForm.$setPristine();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('SitesCtrl', ['$scope', '$location', 'Site',
      function($scope, $location, Site) {
        var page = Number($location.search().page) || 1;
        $scope.clearCreateActions();
        $scope.setKlass("Site");
        $scope.addCreateAction('Create', '#/sites/new', 'create');
        $scope.sites = Site.query({page: page}, function () {
          var len = $scope.sites.length - 1;
          var count = $scope.sites.splice(len)[0].count;
          $scope.page(page, 25, count);
        }, function (res) {
          console.log(res);
        });
  }])
  .controller('NewSystemCtrl', ['$scope', '$routeParams', '$location',
		  'Site', 'System', 'SystemHelper',
      function($scope, $routeParams, $location, Site, System,
              SystemHelper) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("System");
        $scope.n = {};
        $scope.system = new System();
        $scope.system.site = $routeParams.siteId;
        $scope.site = Site.get({ siteId: $routeParams.siteId });
        $scope.save = function () {
          $scope.system.$save({}, function () {
            $scope.systemForm.$setPristine();
            $location.path('/sites/' + $scope.site._id + '/systems/'
		    + $scope.system._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
        SystemHelper.setDeviceUpdater($scope);
  }])
  .controller('SystemCtrl', ['$scope', '$routeParams', 'Site', 'System',
      'Device', 'State', 'DeviceHelper', 'SystemHelper',
      function($scope, $routeParams, Site, System, Device, State,
        DeviceHelper, SystemHelper) {
        $scope.device = {};
        $scope.state = { outputs: {} };
        $scope.n = {};
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("System");
        $scope.system = System.get({ siteId: $routeParams.siteId,
          systemId: $routeParams.systemId }, function () {
            $scope.device = Device.get({ deviceId: $scope.system.device }, function () {
              $scope.n.deviceName = $scope.device.name;
            });
            if (!$scope.system.outputs)
              $scope.system.outputs = [];
            if (!$scope.system.setpoints)
              $scope.system.setpoints = {};
            DeviceHelper.loadDeviceState($scope, $scope.system.device);
          });
        $scope.site = Site.get({ siteId: $routeParams.siteId });
        SystemHelper.setDeviceUpdater($scope);
        $scope.addOutput = function () {
          $scope.system.outputs.push($scope.n.out);
          $scope.n.out = null;
        }
        $scope.dropOutput = function (i) {
          $scope.system.outputs.splice(i);
          $scope.systemForm.$setDirty();
        }
        $scope.addSetpoint = function () {
          $scope.system.setpoints[$scope.n.set] = $scope.n.setValue;
          $scope.n.set = null;
        }
        $scope.dropSetpoint = function (key) {
          delete $scope.system.setpoints[key];
          $scope.systemForm.$setDirty();
        }
        $scope.save = function () {
          $scope.system.$save({}, function (e) {
            $scope.systemForm.$setPristine();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('RightsCtrl', ['$scope', '$location', 'Right',
      function($scope, $location, Right) {
        var page = Number($location.search().page) || 1;
        $scope.clearCreateActions();
        $scope.setKlass("Right");
        $scope.addCreateAction('Create', '#/rights/new', 'create');
        $scope.rights = Right.query({page: page}, function () {
          var len = $scope.rights.length - 1;
          var count = $scope.rights.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }])
  .controller('NewRightCtrl', ['$scope', '$location', 'Right',
      function($scope, $location, Right) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Right");
        $scope.right = new Right();
        $scope.save = function () {
          $scope.right.$save({}, function () {
            $scope.rightForm.$setPristine();
            $location.path('/rights/' + $scope.right._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('RightCtrl', ['$scope', '$routeParams', 'Right',
      function($scope, $routeParams, Right) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("Right");
        $scope.addCreateAction('Create', '#/rights/new', 'create');
        $scope.right = Right.get({ rightId: $routeParams.rightId });
        $scope.save = function () {
          $scope.right.$save({}, function () {
            $scope.rightForm.$setPristine();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('NewUserCtrl', ['$scope', '$location', 'User',
      function($scope, $location, User) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("User");
        $scope.user = new User();
        $scope.save = function () {
          $scope.user.$save({}, function () {
            $scope.userForm.$setPristine();
            $location.path('/users/' + $scope.user._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('UserCtrl', ['$scope', '$routeParams', 'User',
      function($scope, $routeParams, User) {
        $scope.page(1, 1, 0);
        $scope.clearCreateActions();
        $scope.setKlass("User");
        $scope.addCreateAction('Create', '#/users/new', 'create');
        $scope.user = User.get({ userId: $routeParams.userId }, function () {
        });
        $scope.save = function () {
          $scope.user.$save({}, function () {
            $scope.userForm.$setPristine();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('UsersCtrl', ['$scope', '$location', 'User',
      function($scope, $location, User) {
        var page = Number($location.search().page) || 1;
        $scope.clearCreateActions();
        $scope.setKlass("User");
        $scope.addCreateAction('Create', '#/users/new', 'create');
        $scope.users = User.query({page: page}, function () {
          var len = $scope.users.length - 1;
          var count = $scope.users.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }]);

// vim:ts=2 sts=2 sw=2 et:
