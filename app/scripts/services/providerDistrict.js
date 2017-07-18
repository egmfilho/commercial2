/*
* @Author: egmfilho
* @Date:   2017-06-08 12:04:25
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 17:02:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderDistrict', ['Constants', function(constants) {

			var url = constants.api + 'district.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getByCode: getByCode,
					getByName: getByName
				}

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

}());