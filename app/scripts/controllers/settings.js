/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 13:33:54
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-06 17:55:5222
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl', SettingsCtrl);

	SettingsCtrl.$inject = [ '$rootScope', '$scope', '$mdSidenav' ];

	function SettingsCtrl($rootScope, $scope, $mdSidenav) {

		var self = this;

		self.currentView = 'companies';

		$scope.$on('$viewContentLoaded', function() {
			$rootScope.titleBarText = 'Ajustes';
		});

		$scope.$on('$destroy', function() {
			$rootScope.titleBarText = null;
		});

		self.toggleSidenav = function() {
			$mdSidenav('left').toggle();
		};

	}

})();