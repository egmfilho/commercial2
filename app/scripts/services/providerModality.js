/*
* @Author: egmfilho
* @Date:   2017-06-28 12:18:27
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 17:04:28
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderModality', ['Constants', function(constants) {

			var url = constants.api + 'modality.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					getByCode: getByCode,
					getByDescription: getByDescription,
					getAll: getAll
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code) {
					return provider.get({
						action: 'get'
					}, {
						modality_code: code
					}).$promise;
				}

				function getByDescription(description, options) {
					return provider.query({
						action: 'getList'
					}, {
						modality_description: description,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function getAll(options) {
					return provider.query({
						action: 'getList'
					}, {
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

			}];
		}]);

}());