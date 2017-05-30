/*
* @Author: egmfilho
* @Date:   2017-05-29 10:32:39
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 12:03:40
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Person', ['Address', function(Address) {

			var _person = {
				Id: '',
				IdLoja: '',
				Codigo: '',
				Nome: '',
				Tp: '',
				Doc: '',
				IEstadual: '',
				Telefone: '',
				Celular: '',
				Email: '',
				Ativo: '',
				Origem: '',
				Cadastro: '',
				IdCep: '',
				Cep: new Address(),
				TpPessoa: ''
			};

			function Person(person) {
				angular.extend(this, _person);

				if (person) {
					angular.extend(this, person, { 
						Cep: new Address(person.Cep) 
					});
				}
			}

			Person.prototype = {
				setAddress: setAddress
			};

			// ******************************
			// Methods declaration
			// ******************************

			function setAddress(address) {
				if (address)
					this.Cep = new Address(address);
				this.IdCep = this.Cep.IdCep;
			}

			return Person;

		}]);

}());