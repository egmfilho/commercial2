/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-08 13:10:17
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:01:49
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderCity', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'city.php?action=:action';

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
						city_code: code,
						limit: options && options.limit
					}).$promise;
				}

				function getByName(name, options) {
					return provider.query({
						action: 'getList'
					}, {
						city_name: name,
						limit: options && options.limit
					}).$promise;
				}

			}];
		}]);

})();