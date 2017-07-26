/*
* @Author: egmfilho
* @Date:   2017-07-25 13:33:54
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-25 13:58:48
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('ConfigCtrl', ConfigCtrl);

	ConfigCtrl.$inject = [ '$rootScope', '$scope' ];

	function ConfigCtrl($rootScope, $scope) {

		var self = this;

		$scope.$on('$viewContentLoaded', function() {
			$rootScope.titleBarText = 'Ajustes';
		});

		$scope.$on('$destroy', function() {
			$rootScope.titleBarText = null;
		});

	}

}());