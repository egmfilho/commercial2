/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 10:46:07
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-06 13:34:07
 */

(function() {
	'use strict';

	angular.module('commercial2.services')
		.provider('ProviderPerson', [function() {

			var url = null,
				provider = null;

			this.$get = ['$resource', 'Globals', function($resource, Globals) {
				url = Globals.api.get().address + 'person.php?action=:action';

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
					saveAvatar:  saveAvatar,
					check:       check,
					activate:    activate
				};

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
						get_person_credit_limit: options && options.getLimit,
						get_person_attribute: options && options.getAttributes
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
						get_person_credit_limit: options && options.getLimit,
						get_person_attribute: options && options.getAttributes
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
						person_contact: filter && filter.contact,
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
						person_active: options && options.activeOnly,
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

				function saveAvatar(personId, data) {
					return provider.save({
						action: 'avatar'
					}, {
						person_id: personId,
						data: data
					}).$promise;
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