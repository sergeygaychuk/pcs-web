'use strict';

/* Directives */


angular.module('pcs.directives', []).
  directive('pcsOperatorAdmin', [function() {
    return function(scope, elm, attrs) {
      if (elm.text() === 'true') {
        scope.operator.admin = true;
      }
    };
  }]).
  directive('pcsOperatorId', [function() {
    return function(scope, elm, attrs) {
      scope.operator._id = elm.text();
    };
  }]);

// vim:ts=2 sts=2 sw=2 et:
