/*
* @Author: egmfilho
* @Date:   2017-06-02 10:27:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-02 13:50:46
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LogoutCtrl', LogoutCtrl);

	LogoutCtrl.$inject = [ '$rootScope', '$timeout', '$location', 'Authentication' ];

	function LogoutCtrl($rootScope, $timeout, $location, Authentication) {

		var alert = $rootScope.customDialog();
		alert.unclosable().showMessage('Logout', 'Efetuando logout, aguarde...');

		Authentication.logout(function(res) {
			if (res.status == 200) {
				$timeout(function() {
					alert.close();
					$location.path('/login');
				}, 1000);
			}
		});
	}

}());