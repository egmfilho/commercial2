/*
* @Author: egmfilho
* @Date:   2017-08-09 08:44:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-09 12:27:23
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderCep', ['Constants', function(constants) {

			var url = constants.api + 'cep.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					getByCode: getByCode,
					get: get
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code) {
					return provider.get({
						action: 'get'
					}, {
						cep_code: code
					}).$promise;
				}

				function get(filters, options) {
					return provider.query({
						action: 'getList'
					}, {
						cep_code: filters && filters.cep_code,
						public_place: filters && filters.public_place,
						district_id: filters && filters.district_id,
						city_id: filters && filters.city_id,
						uf_id: filters && filters.uf_id,
						limit: options && options.limit
					}).$promise;
				}

			}];
		}]);

}());