/*
* @Author: egmfilho
* @Date:   2017-05-29 17:03:59
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-19 10:23:54
*/

(function() {

	// 'use strict';

	angular.module('commercial2.services')
		.factory('Authentication', Authentication);

	Authentication.$inject = [ '$http', 'Cookies', 'User', 'Constants', 'Globals' ];

	function Authentication($http, cookies, User, constants, Globals) {

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
				Globals.clear();
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