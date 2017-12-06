/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-05-29 10:32:39
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 10:29:58
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Person', ['Globals', 'Address', 'PersonCredit', 'PersonCreditLimit', 'PersonAttribute', function(Globals, Address, PersonCredit, PersonCreditLimit,PersonAttribute) {

			function Person(person) {
				this.person_id            = null;
				this.person_code          = null;
				this.person_name          = null;
				this.person_shortname     = null;
				this.person_cpf           = null;
				this.person_cnpj          = null;
				this.person_type          = Globals.get('default-person-type');
				this.person_active        = null;
				this.person_address       = new Array();
				this.person_credit        = new Array();
				this.person_attribute     = new Array();
				this.person_credit_limit  = new PersonCreditLimit();
				this.person_image         = null;
				this.exibition_name       = null;
				this.queryable            = '';

				if (person) {
					var _root = Globals.api.get().root;

					Object.assign(this, person, { 
						person_address: person.person_address ? person.person_address.map(function(a) { return new Address(a); }) : new Array(),
						person_credit: person.person_credit ? person.person_credit.map(function(a) { return new PersonCredit(a); }) : new Array(),
						person_credit_limit: person.person_credit_limit ? new PersonCreditLimit(person.person_credit_limit) : new PersonCreditLimit(),
						person_attribute: person.person_attribute ? person.person_attribute.map(function(a){ return new PersonAttribute(a); }) : new Array(),
						person_image: person.person_image && person.person_image.indexOf(_root) < 0 ? _root + person.person_image : person.person_image,
						exibition_name: person.person_code + ' ' + person.person_name,
						queryable: person.person_code + ' - ' + person.person_name + ' ' + person.person_shortname
					});
				}
			}

			Person.prototype = {
				isActive: function(){ return this.person_active == 'Y'; },
				getType: getType,
				getMainAddress: getMainAddress,
				setImage: setImage
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

			/**
			 * Configura a url da imagem do cliente
			 * @param {string} url - A url da imagem
			 */
			function setImage(url) {
				var _root = Globals.api.get().root;
				this.person_image = url.indexOf(_root) < 0 ? _root + url : url;
			}

		}]);

})();