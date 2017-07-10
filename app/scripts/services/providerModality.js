/*
* @Author: egmfilho
* @Date:   2017-06-28 12:18:27
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-10 08:59:30
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
					getById: getById,
					getByCode: getByCode,
					getByDescription: getByDescription
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, options) {
					return provider.get({
						action: 'get'
					}, {
						modality_id: id,
						company_id: options && options.companyId,
						get_modality_item: options && options.getInstallments
					}).$promise;
				}

				function getByCode(code, options) {
					return provider.get({
						action: 'get'
					}, {
						modality_code: code,
						company_id: options && options.companyId,
						get_modality_item: options && options.getInstallments
					}).$promise;
				}

				function getByDescription(description, options) {
					return provider.query({
						action: 'getList'
					}, {
						modality_description: description,
						company_id: options && options.companyId,
						get_modality_item: options && options.getInstallments,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

			}];
		}]);

}());