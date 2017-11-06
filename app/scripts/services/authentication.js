/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 17:03:59
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-06 13:06:34
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Authentication', Authentication);

	Authentication.$inject = [ '$q', '$http', 'Cookies', 'User', 'ProviderPersonCredit', 'Constants', 'Globals' ];

	function Authentication($q, $http, cookies, User, providerPersonCredit, constants, Globals) {

		function login(username, password, callback) {
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'login.php',
				data: { user_user: username, user_pass: password }
			}).then(function(res) {
				if (res.status == 200) {
					if (constants.isElectron) {
						require('electron').remote.getGlobal('isValidSession').value = true;
					}

					var user = new User(res.data.data);
					constants.debug && console.log(user);
					cookies.set({ 
						name: constants['cookie'], 
						value: window.btoa(JSON.stringify(user)) 
					}).then(function(success) {
						callback(res);
					});
				}
			}, function(res) {
				if (constants.debug) console.error(res);
				callback(res);
			});
		}

		function logout(callback) {
			$http({
				method: 'POST',
				url: Globals.api.get().address + 'logout.php'
			}).then(function(res) {
				if (constants.isElectron) {
					require('electron').ipcRenderer.send('shutdown');
				}

				$q.all([cookies.clear(), Globals.clear()])
					.then(function(success) {
						callback(res);
					});

			}, function(res) {
				constants.debug && console.error(res);
				callback(res);
			});
		}

		return {
			login: login,
			logout: logout
		}
	}

})();