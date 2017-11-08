/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-25 16:51:12
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-07 09:02:24
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('SettingsCtrl.Users', Users);

	Users.$inject = [ '$rootScope', '$scope', 'ProviderUser', 'User', 'Constants' ];

	function Users ($rootScope, $scope, providerUser, User, constants) {

		var self = this;

		this.users = [ ];

		constants.debug && console.log('SettingsCtrl.Users pronto!');

		$rootScope.loading.load();
		providerUser.getAll().then(function(success) {
			self.users = success.data.map(function(u) { return new User(u) });

			$rootScope.loading.unload();
		}, function(error) {
			constants.debug && console.log(error);
			$rootScope.loading.unload();
		});
	}

})();