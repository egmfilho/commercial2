/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 16:51:12
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-29 12:27:15
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
		this.filters = {
			profiles: {
				property: null,
				reverse: false
			},
			users: {
				property: 'user_name',
				reverse: false,
				getClassesFor: function(property) {
					var classes = 'fa ';
					if (property == self.filters.users.property) {
						classes += self.filters.users.reverse ? 'fa-sort-down' : 'fa-sort-up';
					} else {
						classes += 'fa-sort fandangos';
					}
					return classes;
				}
			}
		};

		constants.debug && console.log('SettingsCtrl.Users pronto!');

		function getUsers() {
			$rootScope.loading.load();
			providerUser.getAll().then(function(success) {
				self.users = success.data.map(function(u) { 
					var user = new User(u);
					user.user_profile_name = user.user_profile.user_profile_name;
					return user;
				});
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

		this.setUsersTableFilters = function(property) {
			if (property == self.filters.users.property) {
				self.filters.users.reverse = !self.filters.users.reverse;
			} else {
				self.filters.users.reverse = false;
			}
			
			self.filters.users.property = property;
		};
	}

})();