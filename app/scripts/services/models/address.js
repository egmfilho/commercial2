/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-23 12:44:19
*/

(function() {
	'use strict';

	angular.module('commercial2.services')
		.factory('Cep', [function() {

			function Cep(cep) {
				this.cep_code          = null;
				this.uf_id             = null;
				this.city_id           = null;
				this.district_id       = null;
				this.public_place      = null;
				this.public_place_type = null;

				Object.assign(this, cep);
			}

			return Cep;

		}]);

	angular.module('commercial2.services')
		.factory('District', [function() {

			function District(district) {
				this.district_id   = null;
				this.district_code = null;
				this.district_name = null;

				Object.assign(this, district);
			}

			return District;

		}]);

	angular.module('commercial2.services')
		.factory('City', [function() {

			function City(city) {
				this.city_id   = null;
				this.uf_id     = null;
				this.city_code = null;
				this.city_name = null;
				this.city_ibge = null;
				this.city_ddd  = null;

				Object.assign(this, city);
			}

			return City;

		}]);

	angular.module('commercial2.services')
		.factory('Address', ['District', 'City', function(District, City) {

			var scope;

			function Address(address) {
				scope = this;

				this.person_id                   = null;
				this.uf_id                       = null;
				this.city_id                     = null;
				this.district_id                 = null;
				this.person_address_cep          = null;
				this.person_address_code         = null;
				this.person_address_active       = 'Y';
				this.person_address_main         = 'N';
				this.person_address_delivery     = 'Y';
				this.person_address_ie           = null;
				this.person_address_type         = null;
				this.person_address_public_place = null;
				this.person_address_number       = null;
				this.icms_type                   = null;
				this.city                        = new City();
				this.district                    = new District();
				this.person_address_contact              = new Array();

				if (address) {
					Object.assign(this, address, { 
						city: new City(address.city), 
						district: new District(address.district) 
					});
				}
			}

			Address.prototype = {
				toString: toString,
				setDistrict: setDistrict,
				setCity: setCity
			};

			return Address;

			// ******************************
			// Methods declaration
			// ******************************

			function toString() {
				var string = '';
				
				string += scope.person_address_type + ' ';
				string += scope.person_address_public_place + ' ';
				string += scope.person_address_number + ' - ';
				string += scope.district.district_name + ', '; 
				string += scope.city.city_name + ' - ';
				string += scope.city.uf_id;

				return string.toString();
			}

			function setDistrict(district) {
				if (district)
					scope.district = new District(district);

				// setTimeout(function() { scope.district_id = scope.district.district_id; }, 500);
				scope.district_id = scope.district.district_id;
			}

			function setCity(city) {
				if (city)
					scope.city = new City(city);

				scope.city_id = scope.city.city_id;
			}

		}]);
		
}());