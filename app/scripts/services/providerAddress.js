/*
* @Author: egmfilho
* @Date:   2017-06-20 11:27:33
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 17:02:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderAddress', ['Constants', function(constants) {

			var url = constants.api + 'person_address.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					save: save
				}

				// ******************************
				// Methods declaration
				// ******************************

				function save(address) {
					return provider.save({
						action: 'insert'
					}, address).$promise;
				}

			}];
		}]);

}());