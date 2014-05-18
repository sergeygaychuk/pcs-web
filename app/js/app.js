'use strict';


// Declare app level module which depends on filters, and services
angular.module('pcs', [
  'ngRoute',
  'pcs.filters',
  'pcs.services',
  'pcs.directives',
  'pcs.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sites', {templateUrl: 'partials/sites.html', controller: 'SitesCtrl'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'UsersCtrl'});
  $routeProvider.otherwise({redirectTo: '/sites'});
}]);