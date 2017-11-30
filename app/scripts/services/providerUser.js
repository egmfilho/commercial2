/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-25 17:17:10
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-30 11:00:46
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
					getById: getById,
					getAll: getAll,
					setNewPass: setNewPass
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id) {
					return provider.query({
						action: 'get'
					}, {
						user_id: id,
						get_user_profile: true,
						get_user_price: true,
						get_user_company_erp: true,
						get_user_price_erp: true,
						get_user_company: true
					}).$promise;
				}

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