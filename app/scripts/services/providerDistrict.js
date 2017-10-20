/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-08 12:04:25
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:01:58
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderDistrict', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'district.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getByCode: getByCode,
					getByName: getByName
				};

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code, options) {
					return provider.get({
						action: 'get'
					}, {
						district_code: code,
						limit: options && options.limit
					}).$promise;
				}

				function getByName(name, options) {
					return provider.query({
						action: 'getList'
					}, {
						district_name: name,
						limit: options && options.limit
					}).$promise;
				}

			}];
		}]);

})();