/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 13:17:22
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('District', [function() {

			var _district = {
				district_id: '',
				district_code: '',
				district_name: ''
			};

			function District(district) {
				angular.extend(this, _district, district);
			}

			return District;

		}]);

	angular.module('commercial2.services')
		.factory('City', [function() {

			var _city = {
				city_id: '',
				uf_id: '',
				city_code: '',
				city_name: '',
				city_ibge: '',
				city_ddd: ''
			};

			function City(city) {
				angular.extend(this, _city, city);
			}

			return City;

		}]);

	angular.module('commercial2.services')
		.factory('Address', ['District', 'City', function(District, City) {

			var _address = {
				person_id: '',
				uf_id: '',
				city_id: '',
				district_id: '',
				person_address_cep: '',
				person_address_code: '',
				person_address_active: '',
				person_address_main: '',
				person_address_delivery: '',
				person_address_ie: '',
				person_address_type: '',
				person_address_public_place: '',
				person_address_number: '',
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

			return Address;

		}]);
		
}());