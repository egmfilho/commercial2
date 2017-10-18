/*
* @Author: egmfilho
* @Date:   2017-06-28 12:27:57
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-21 16:21:49
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderTerm', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'term.php?action=:action';

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false }
				});

				return {
					getById: getById,
					getByCode: getByCode,
					getByDescription: getByDescription,
					getAll:    getAll
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, options) {
					return provider.get({
						action: 'get'
					}, {
						term_id: id,
						get_term_modality: options && options.getModality
					}).$promise;
				}

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

})();