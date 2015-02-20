'use strict';

/* Directives */


angular.module('pcs.directives', []).
  directive('pcsOperatorRights', [function() {
    return function(scope, elm, attrs) {
      if (elm.text().length > 0) {
        scope.operator.rights = JSON.parse(elm.text());
      }
    };
  }]).
  directive('pcsOperatorAdmin', [function() {
    return function(scope, elm, attrs) {
      if (elm.text() === 'true') {
        scope.operator.admin = true;
      }
    };
  }]).
  directive('pcsOperatorSuperadmin', [function() {
    return function(scope, elm, attrs) {
      if (elm.text() === 'true') {
        scope.operator.superadmin = true;
      }
    };
  }]).
  directive('pcsOperatorId', [function() {
    return function(scope, elm, attrs) {
      scope.operator._id = elm.text();
    };
  }]).
  directive('pcsOperatorCan', [function() {
    function link(scope, elm, attrs) {
      if (scope.operator.can(attrs.pcsOperatorCan, attrs.accessKlass)) {
        return elm.show();
      }
      elm.hide();
    };
    return {
      link: link,
      scope: {
        operator: "="
      }
    };
  }]);

// vim:ts=2 sts=2 sw=2 et:
