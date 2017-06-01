/*
* @Author: egmfilho
* @Date:   2017-05-29 17:03:59
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-01 10:27:27
*/

(function() {

	// 'use strict';

	angular.module('commercial2.services')
		.factory('Authentication', Authentication);

	Authentication.$inject = [ '$rootScope', '$http', '$sessionStorage', 'User', 'Constants' ];

	function Authentication($rootScope, $http, $sessionStorage, User, constants) {

		function login(username, password, callback) {
			if (constants['bypass-login']) {
				var res = JSON.parse(constants['login-fake-response']), 
					user = new User(res.data.data);
				$sessionStorage[constants.cookie] = window.btoa(JSON.stringify(user));
				console.log('login bypassed');
				callback(res);
				return;
			}

			$http({
				method: 'POST',
				url: constants.api + 'login.php',
				data: { user: username, pass: password }
			}).then(function(res) {
				if (res.status == 200) {
					var user = new User(res.data.data);
					if (constants.debug) console.log(user);
					$sessionStorage[constants.cookie] = window.btoa(JSON.stringify(user));
				}
				callback(res.data);
			}, function(res) {
				if (constants.debug) console.log(res);
				callback(res.data);
			});
		}

		function logout(callback) {
			$http({
				method: 'POST',
				url: constants.api + 'logout.php'
			}).then(function(res) {
				$sessionStorage.$reset();
				callback(res);
			}, function(res) {
				if (cosntants.debug) console.log(res);
				callback(res);
			});
		}

		return {
			login: login,
			logout: logout
		}
	}

}());