/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-14 09:48:06
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:01:36
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderBank', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'bank.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getById: getById,
					getByName: getByName
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, options) {
					return provider.get({
						action: 'get'
					}, {
						bank_id: id,
						get_bank_agency: true,
						limit: options && options.limit
					}).$promise;
				}

				function getByName(name, options) {
					return provider.query({
						action: 'getList'
					}, {
						bank_name: name,
						get_bank_agency: options && options.getAgencies,
						limit: options && options.limit
					}).$promise;
				}

			}];
		}]);

})();