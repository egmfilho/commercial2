/*
 * @Author: egmfilho
 * @Date:   2017-07-25 17:17:10
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:00:39
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderUser', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'user.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getAll: getAll,
					setNewPass: setNewPass
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getAll() {
					return provider.query({
						action: 'getList'
					}, { 
						get_user_profile: true
					}).$promise;
				}

				function setNewPass(data) {
					return provider.query({
						action: 'newPass'
					}, {
						user_id: data && data.user_id,
						user_pass: data && data.user_pass,
						user_new_pass: data && data.user_new_pass
					}).$promise;
				}

			}];
		}]);

})();