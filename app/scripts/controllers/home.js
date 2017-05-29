/*
* @Author: egmfilho
* @Date:   2017-05-24 17:37:37
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 09:41:44
*/
'use strict';

angular.module('commercial2.controllers')
	.controller('HomeCtrl', HomeCtrl);

HomeCtrl.$inject = [ '$scope', '$timeout', '$mdSidenav' ];

function HomeCtrl($scope, $timeout, $mdSidenav) {

	$scope.toggleLeft = function() {
		$mdSidenav('left-menu').toggle();
	};

}