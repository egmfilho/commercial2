/*
* @Author: egmfilho
* @Date:   2017-05-29 10:32:39
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 13:53:13
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Person', ['Address', function(Address) {

			var self = this;

			function Person(address) {
				angular.extend(this, {
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
				}, address);
			}

			Person.prototype = {
				setAddress: setAddress
			};

			// ******************************
			// Methods declaration
			// ******************************

			function setAddress(address) {
				self.IdCep = address.IdCep;
				self.Cep = angualar.extend({ }, address);
			}

			return Person;

		}]);

}());