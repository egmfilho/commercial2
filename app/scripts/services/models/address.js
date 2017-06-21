/*
* @Author: egmfilho
* @Date:   2017-05-29 09:39:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-21 12:02:11
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

				angular.extend(this, cep);
			}

			return Cep;

		}]);

	angular.module('commercial2.services')
		.factory('District', [function() {

			function District(district) {
				this.district_id   = null;
				this.district_code = null;
				this.district_name = null;

				angular.extend(this, district);
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

				angular.extend(this, city);
			}

			return City;

		}]);

	angular.module('commercial2.services')
		.factory('Address', ['District', 'City', function(District, City) {

			function Address(address) {
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
					angular.extend(this, address, { 
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
				return this.person_address_type + ' ' +
					this.person_address_public_place + ' ' + 
					this.person_address_number + ' - ' +
					this.district.district_name + ', ' + 
					this.city.city_name + ' - ' + 
					this.city.uf_id;
			}

			function setDistrict(district) {
				if (district)
					this.district = new District(district);

				setTimeout(function() { this.district_id = this.district.district_id; }, 500);
			}

			function setCity(city) {
				if (city)
					this.city = new City(city);

				this.city_id = this.city.city_id;
			}

		}]);
		
}());