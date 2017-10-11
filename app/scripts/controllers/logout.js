/*
* @Author: egmfilho
* @Date:   2017-06-02 10:27:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-16 10:09:38
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LogoutCtrl', LogoutCtrl);

	LogoutCtrl.$inject = [ '$rootScope', '$timeout', '$location', 'Authentication', 'OpenedOrderManager' ];

	function LogoutCtrl($rootScope, $timeout, $location, Authentication, OpenedOrderManager) {

		var alert = $rootScope.customDialog();
		alert.showUnclosable('Logout', 'Efetuando logout, aguarde...');

		Authentication.logout(function(res) {
			if (res.status == 200) {
				$timeout(function() {
					OpenedOrderManager.clear();
					alert.close();
					$location.path('/login');
				}, 1000);
			}
		});
	}

}());