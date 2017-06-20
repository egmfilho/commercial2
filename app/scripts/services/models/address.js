/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-20 09:56:51
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Cep', [function() {

			var _cep = { 
				cep_code: null,
				uf_id: null,
				city_id: null,
				district_id: null,
				public_place: null,
				public_place_type: null
			};

			function Cep(cep) {
				angular.extend(this, _cep, cep);
			}

			return Cep;

		}]);

	angular.module('commercial2.services')
		.factory('District', [function() {

			var _district = {
				district_id: null,
				district_code: null,
				district_name: null
			};

			function District(district) {
				angular.extend(this, _district, district);
			}

			return District;

		}]);

	angular.module('commercial2.services')
		.factory('City', [function() {

			var _city = {
				city_id: null,
				uf_id: null,
				city_code: null,
				city_name: null,
				city_ibge: null,
				city_ddd: null
			};

			function City(city) {
				angular.extend(this, _city, city);
			}

			return City;

		}]);

	angular.module('commercial2.services')
		.factory('Address', ['District', 'City', function(District, City) {

			var _address = {
				person_id: null,
				uf_id: null,
				city_id: null,
				district_id: null,
				person_address_cep: null,
				person_address_code: null,
				person_address_active: 'Y',
				person_address_main: 'N',
				person_address_delivery: 'Y',
				person_address_ie: null,
				person_address_type: null,
				person_address_public_place: null,
				person_address_number: null,
				icms_type: null,
				city: new City(),
				district: new District()
			};

			function Address(address) {
				angular.extend(this, _address);

				if (address) {
					angular.extend(this, address, { 
						city: new City(address.city), 
						district: new District(address.district) 
					});
				}
			}

			Address.prototype = {
				toString: toString
			};

			return Address;

			// ******************************
			// Methods declaration
			// ******************************

			function toString() {
				return this.person_address_type + ' ' +
					this.person_address_public_place + ' ' + 
					this.person_address_number + ' - ' +
					this.district.district_name + ', ' + 
					this.city.city_name + ' - ' + 
					this.city.uf_id
			}

		}]);
		
}());