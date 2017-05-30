/*
* @Author: egmfilho
* @Date:   2017-05-29 17:03:59
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 11:08:21
*/

(function() {

	// 'use strict';

	angular.module('commercial2.services')
		.factory('Authentication', Authentication);

	Authentication.$inject = [ '$rootScope', '$http', '$cookies', 'User', 'Constants' ];

	function Authentication($rootScope, $http, $cookies, User, constants) {

		function login(username, password, callback) {
			if (constants['bypass-login']) {
				var res = JSON.parse(constants['login-fake-response']), 
					user = new User(res.data.data);
				$cookies.put(constants.cookie, window.btoa(JSON.stringify(user)), {});
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
					$cookies.put(constants.cookie, window.btoa(JSON.stringify(user)), {});
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
				$cookies.remove(constants.cookie);
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