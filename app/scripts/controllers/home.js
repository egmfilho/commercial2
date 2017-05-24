'use strict';

angular.module('commercial2.controllers')
	.controller('HomeCtrl', HomeCtrl);

HomeCtrl.$inject = [ '$scope', '$timeout', '$mdSidenav' ];

function HomeCtrl($scope, $timeout, $mdSidenav) {

	$scope.toggleLeft = function() {
		$mdSidenav('left-menu').toggle();
	};

}