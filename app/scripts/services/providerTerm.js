/*
* @Author: egmfilho
* @Date:   2017-06-28 12:27:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 12:30:51
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderTerm', ['Constants', function(constants) {

			var url = constants.api + 'term.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					getByCode: getByCode,
					getByName: getByDescription,
					getAll:    getAll
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

				function getByName(description, options) {
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