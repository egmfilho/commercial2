/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-05-29 09:39:24
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-01 12:28:35
*/

(function() {
	'use strict';

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
		.factory('Cep', ['District', 'City', function(District, City) {

			function Cep(cep) {
				this.cep_code          = null;
				this.uf_id             = null;
				this.city_id           = null;
				this.district_id       = null;
				this.public_place      = null;
				this.public_place_type = null;
				this.district          = new District();
				this.city              = new City();

				if (cep) {
					Object.assign(this, cep, {
						district: new District(cep.district),
						city: new City(cep.city)
					});
				}
			}

			Cep.prototype = {
				toAddress: function() {
					return {
						person_address_cep: this.cep_code,
						uf_id: this.uf_id,
						city_id: this.city_id,
						district_id: this.district_id,
						person_address_public_place: this.public_place,
						person_address_type: this.public_place_type,
						city: this.city,
						district: this.district
					}
				},

				setDistrict: function(district) {
					if (district) {
						this.district = new District(district);
						this.district_id = this.district.district_id;
					}
				},
	
				setCity: function(city) {
					if (city) {
						this.city = new City(city);
						this.city_id = this.city.city_id;
					}
				}
			};

			return Cep;

		}]);

	angular.module('commercial2.services')
		.factory('Address', ['District', 'City', 'Globals', function(District, City, Globals) {

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
				this.person_address_ie           = Globals.get('default-icms-type').value;
				this.person_address_type         = null;
				this.person_address_public_place = null;
				this.person_address_number       = null;
				this.person_address_note         = null;
				this.person_address_reference    = null;
				this.tel                         = null;
				this.cel                         = null;
				this.icms_type                   = Globals.get('default-icms-type').code;
				this.city                        = new City();
				this.district                    = new District();
				this.person_address_contact      = new Array();

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
				setCity: setCity,
				merge: merge,
				getMainContact: getMainContact
			};

			return Address;

			// ******************************
			// Methods declaration
			// ******************************

			function toString() {
				var string = '';
				
				string += this.person_address_type + ' ';
				string += this.person_address_public_place + ' ';
				string += this.person_address_number + ' - ';
				string += this.district.district_name + ', '; 
				string += this.city.city_name + ' - ';
				string += this.city.uf_id;

				return string.toString();
			}

			function setDistrict(district) {
				if (district) {
					this.district = new District(district);
					this.district_id = this.district.district_id;
				}
			}

			function setCity(city) {
				if (city) {
					this.city = new City(city);
					this.city_id = this.city.city_id;
				}
			}

			function merge(address) {
				Object.assign(this, address, { 
					city: new City(address.city), 
					district: new District(address.district),
				});
			}

			function getMainContact() {
				return this.person_address_contact.map(function(contact) {
					if (contact.person_address_contact_main == 'Y')
						return contact;
				})[0];
			}

		}]);
		
})();