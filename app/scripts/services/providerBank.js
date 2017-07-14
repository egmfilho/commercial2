/*
* @Author: egmfilho
* @Date:   2017-07-14 09:48:06
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-14 13:05:27
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderBank', ['Constants', function(constants) {

			var url = constants.api + 'bank.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getById: getById,
					getByName: getByName
				}

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

}());