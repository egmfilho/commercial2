/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 16:51:12
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-27 15:47:29
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Users', Users);

	Users.$inject = [ '$rootScope', '$scope', '$http', 'ProviderUser', 'User', 'UserProfile', 'Globals', 'Constants' ];

	function Users ($rootScope, $scope, $http, providerUser, User, UserProfile, Globals, constants) {

		var self = this;

		this.view = 'profiles';
		this.profiles = [ ];
		this.users = [ ];

		constants.debug && console.log('SettingsCtrl.Users pronto!');

		function getUsers() {
			$rootScope.loading.load();
			providerUser.getAll().then(function(success) {
				self.users = success.data.map(function(u) { return new User(u) });
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function getProfiles() {
			$rootScope.loading.load();
			$http({
				method: 'GET',
				url: Globals.api.get().address + 'user_profile.php?action=getList'
			}).then(function(success) {
				self.profiles = success.data.data.map(function(p) {
					return new UserProfile(p);
				});
				$rootScope.loading.unload();
			}, function(error) {
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

		getProfiles();

		this.changeView = function(viewName) {
			switch(viewName) {
				case 'profiles': {
					getProfiles();
					this.view = viewName;
					break;
				}

				case 'users': {
					getUsers();
					this.view = viewName;
					break;
				}
			}
		}
	}

})();