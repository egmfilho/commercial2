/*
* @Author: egmfilho
* @Date:   2017-05-29 10:46:07
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 17:30:31
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
					getById:   getById,
					getByCode: getByCode,
					getByName: getByName,
					getByType: getByType,
					save:      save
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
						get_person_address_district: options && options.getAddress
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
						get_person_address_district: options && options.getAddress
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
						limit: options && options.limit,
						page: options && options.page
					}).$promise;
				}

				function save(person) {
					return provider.save({
						action: 'insert'
					}, person).$promise;
				}

			}];

		}]);

}());