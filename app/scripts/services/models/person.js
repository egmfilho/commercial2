/*
* @Author: egmfilho
* @Date:   2017-05-29 10:32:39
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-30 17:07:12
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Person', ['Constants', 'Address', 'PersonCredit', function(constants, Address, PersonCredit) {

			function Person(person) {
				this.person_id      = null;
				this.person_code    = null;
				this.person_name    = null;
				this.person_cpf     = null;
				this.person_cnpj    = null;
				this.person_type    = constants['default-person-type'];
				this.person_active  = null;
				this.person_address = new Array();
				this.person_credit  = new Array();

				if (person) {
					Object.assign(this, person, { 
						person_address: person.person_address ? person.person_address.map(function(a) { return new Address(a); }) : new Array(),
						person_credit: person.person_credit ? person.person_credit.map(function(a) { return new PersonCredit(a); }) : new Array()
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