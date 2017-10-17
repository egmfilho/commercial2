/*
* @Author: egmfilho
* @Date:   2017-05-29 10:46:07
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-30 16:51:31
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderPerson', ['Constants', function(constants) {

			var url = constants.api + 'person.php?action=:action',
				provider = null;

			this.$get = ['$resource', function($resource) {

				provider = $resource(url, { }, {
					get:    { method: 'POST', isArray: false },
					query:  { method: 'POST', isArray: false },
					save:   { method: 'POST', isArray: false },
				});

				return {
					getById:     getById,
					getByCode:   getByCode,
					getByName:   getByName,
					getByFilter: getByFilter,
					getByType:   getByType,
					save:        save,
					check:       check,
					activate:    activate
				}

				// ******************************
				// Methods declaration
				// ******************************

				function getById(id, category, options) {
					return provider.get({
						action: 'get'
					}, {
						person_id: id,
						person_category: category,
						get_person_address: options && options.getAddress,
						get_person_address_city: options && options.getAddress,
						get_person_address_district: options && options.getAddress,
						get_person_address_contact: options && options.getContact,
						get_person_credit: options && options.getCredit,
						get_person_credit_limit: options && options.getLimit
					}).$promise;
				}

				function getByCode(code, category, options) {
					return provider.get({
						action: 'get'
					}, {
						person_code: code,
						person_category: category,
						get_person_address: options && options.getAddress,
						get_person_address_city: options && options.getAddress,
						get_person_address_district: options && options.getAddress,
						get_person_address_contact: options && options.getContact,
						get_person_credit: options && options.getCredit,
						get_person_credit_limit: options && options.getLimit
					}).$promise;
				}

				function getByName(name, category, options) {
					return provider.query({
						action: 'getList'
					}, {
						person_name: name,
						person_category: category,
						get_person_address: options && options.getAddress,
						get_person_address_city: options && options.getAddress,
						get_person_address_district: options && options.getAddress,
						get_person_address_contact: options && options.getContact,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function getByFilter(filter, options) {
					return provider.query({
						action: 'getList'
					}, {
						person_doc: filter && filter.doc,
						person_name: filter && filter.name,
						person_active: filter && filter.active,
						person_category: filter && filter.category,
						get_person_address: options && options.getAddress,
						get_person_address_city: options && options.getAddress,
						get_person_address_district: options && options.getAddress,
						get_person_address_contact: options && options.getContact,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function getByType(category, options) {
					return provider.query({
						action: 'getList'
					}, {
						person_category: category,
						get_person_address: options && options.getAddress,
						get_person_address_city: options && options.getAddress,
						get_person_address_district: options && options.getAddress,
						get_person_address_contact: options && options.getContact,
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function save(person, category) {
					person.person_category = category;
					return provider.save({
						action: 'insert'
					}, person).$promise;
				}

				function check(cpf, cnpj, category) {
					return provider.save({
						action: 'check'
					}, {
						person_cpf: cpf,
						person_cnpj: cnpj,
						person_category: category
					}).$promise;
				}

				function activate(id, category) {
					return provider.save({
						action: 'activate'
					}, {
						person_id: id,
						person_category: category
					}).$promise;
				}

			}];

		}]);

})();