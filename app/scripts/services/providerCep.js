/*
* @Author: egmfilho
* @Date:   2017-08-09 08:44:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-11 08:49:05
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderCep', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'cep.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					getByCode: getByCode,
					get: get
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code) {
					return provider.get({
						action: 'get'
					}, {
						cep_code: code,
						get_cep_uf: true,
						get_cep_city: true,
						get_cep_district: true
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
						limit: options && options.limit,
						get_cep_uf: options && options.getUF,
						get_cep_city: options && options.getCity,
						get_cep_district: options && options.getDistrict
					}).$promise;
				}

			}];
		}]);

})();