/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 10:31:57
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Address', [function() {

			function Endereco(endereco) {
				angular.extend(this, {
					IdCep: '',
					CdCep: '',
					Logradouro: '',
					Bairro: '',
					Cidade: '',
					DDD: '',
					UF: '',
					Numero: ''
				}, endereco);
			}

			return Endereco;

		}]);
		
}());