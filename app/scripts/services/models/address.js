/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 12:21:14
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Address', [function() {

			var _address = {
				IdCep: '',
				CdCep: '',
				Logradouro: '',
				Bairro: '',
				Cidade: '',
				DDD: '',
				UF: '',
				Numero: ''
			};

			function Address(address) {
				angular.extend(this, _address, address);
			}

			return Address;

		}]);
		
}());