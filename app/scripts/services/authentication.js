/*
* @Author: egmfilho
* @Date:   2017-05-29 17:03:59
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-16 10:15:27
*/

(function() {

	// 'use strict';

	angular.module('commercial2.services')
		.factory('Authentication', Authentication);

	Authentication.$inject = [ '$rootScope', '$http', 'Cookies', 'User', 'Constants' ];

	function Authentication($rootScope, $http, cookies, User, constants) {

		function login(username, password, callback) {
			$http({
				method: 'POST',
				url: constants.api + 'login.php',
				data: { user_user: username, user_pass: password }
			}).then(function(res) {
				if (res.status == 200) {
					var user = new User(res.data.data);
					constants.debug && console.log(user);
					cookies.set({ 
						name: constants['cookie'], 
						value: window.btoa(JSON.stringify(user)) 
					});
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
				cookies.clear();
				$rootScope.clearCredentials();
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