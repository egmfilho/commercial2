/*
* @Author: egmfilho
* @Date:   2017-06-28 12:27:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 17:02:08
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
					getByDescription: getByDescription,
					getAll:    getAll
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getByCode(code, options) {
					return provider.get({
						action: 'get'
					}, {
						term_code: code,
						get_term_modality: options && options.getModality
					}).$promise;
				}

				function getByDescription(description, options) {
					return provider.query({
						action: 'getList'
					}, {
						term_description: description,
						get_term_modality: options && options.getModality,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function getAll(options) {
					return provider.query({
						action: 'getList'
					}, {
						get_term_modality: options && options.getModality,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

			}];
		}]);

}());