/*
* @Author: egmfilho
* @Date:   2017-05-29 10:32:39
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-07 11:58:50
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Person', ['Address', function(Address) {

			var _person = {
				person_id: null,
				person_code: null,
				person_name: null,
				person_cpf: null,
				person_cnpj: null,
				person_type: null,
				person_active: null,
				person_address: [ ]
			};

			function Person(person) {
				angular.extend(this, _person);

				if (person) {
					angular.extend(this, person, { 
						person_address: person.person_address ? person.person_address.map(function(a) { return new Address(a); }) : [ ]
					});
				}
			}

			Person.prototype = {
				isActive: this.person_active != 'N',
				getType: getType,
				getMainAddress: getMainAddress
			};

			return Person;

			// ******************************
			// Methods declaration
			// ******************************

			/**
			* Retorna o tipo de pessoa (Física ou Jurídica).
			* @returns {string} - Uma string com o tipo.
			*/
			function getType() {
				if (!this.person_type) return;

				return this.person_type == 'J' ? 'Jurídica' : 'Física';
			}

			/**
			* Retorna o endereco principal.
			* @returns {object} - O endereco principal.
			*/
			function getMainAddress() {
				return this.person_address.find(function(a) {
					return a.person_address_main != 'N';
				});
			}

		}]);

}());