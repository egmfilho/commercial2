/*
* @Author: egmfilho
* @Date:   2017-05-29 10:46:07
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 15:59:54
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

				function getById(id, type) {
					return provider.get({
						action: 'get'
					}, {
						IdPessoa: id,
						TpPessoa: type
					}).$promise;
				}

				function getByCode(code, type) {
					return provider.get({
						action: 'get'
					}, {
						CdPessoa: code,
						TpPessoa: type
					}).$promise;
				}

				function getByName(name, type, limit, page) {
					return provider.query({
						action: 'getList'
					}, {
						NmPessoa: name,
						TpPessoa: type,
						Limite: limit,
						page: page
					}).$promise;
				}

				function getByType(type) {
					return provider.query({
						action: 'getList'
					}, {
						TpPessoa: type
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