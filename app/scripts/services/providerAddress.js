/*
 * @Author: egmfilho
 * @Date:   2017-06-20 11:27:33
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:04:17
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderAddress', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'person_address.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getByPerson: getByPerson,
					save: save
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getByPerson(personId, options) {
					return provider.query({
						action: 'getList'
					}, {
						person_id: personId,
						get_person_address_city: options && options.getCity,
						get_person_address_district: options && options.getDistrict,
						get_person_address_contact: options && options.getContact
					}).$promise;
				}

				function save(address) {
					return provider.save({
						action: 'insert'
					}, address).$promise;
				}

			}];
		}]);

})();