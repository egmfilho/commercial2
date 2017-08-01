/*
* @Author: egmfilho
* @Date:   2017-06-08 09:24:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-01 11:12:03
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('NewAddressCtrl', NewAddressCtrl);

	NewAddressCtrl.$inject = [ 
		'$rootScope',
		'$scope', 
		'$http',
		'ProviderAddress',
		'Address', 
		'ProviderDistrict', 
		'District', 
		'ProviderCity', 
		'City',
		'Contact', 
		'Globals',
		'Constants' 
	];

	function NewAddressCtrl($rootScope, $scope, $http, providerAddress, Address, providerDistrict, District, providerCity, City, Contact, Globals, constants) {

		var self = this, _personId = null;

		self.types               = [ 'AV', 'EST', 'PC', 'RUA', 'ROD' ];
		
		self.newAddress          = new Address();

		self.getCep              = getCep;
		self.queryDistrict       = null;
		self.queryDistrictResult = [ ];
		self.queryCity           = null;
		self.queryCityResult     = [ ];

		self.clear 	             = clear;
		self.submit              = submit;
		self.updateSearch        = updateSearch;
		self.districtChanged     = districtChanged;
		self.cityChanged         = cityChanged;
		self.icmsChanged         = icmsChanged;
		self.focusOn             = focusOn;

		$scope.$on('orderViewLoaded', function() {
			constants.debug && console.log('new address controller loaded!');
			clear();
		});

		$scope.$on('customerAdded', function(event, args) {
			_personId = args.person_id;
			self.newAddress.person_id = _personId;
			clear();
		});

		$scope.$on('modalCustomerAddress', function(event, args) {
			_personId = args.person_id;
			self.newAddress.person_id = _personId;
			clear();
		});

		$scope.$watch(function() {
			return self.queryDistrict;
		}, function(newValue, oldValue) {
			if (newValue)
				searchDistrict();
		});

		$scope.$watch(function() {
			return self.queryCity;
		}, function(newValue, oldValue) {
			if (newValue)
				searchCity();
		});

		// ******************************
		// Methods declaration
		// ******************************

		function getCep(cep) {
			if (!cep) return;

			$rootScope.loading.load();
			$http({
				method: 'POST',
				url: constants.api + 'cep.php?action=get',
				data: { 
					cep_code: cep
				}
			}).then(function(success) {
				self.newAddress.person_address_type = success.data.data.public_place_type;
				self.newAddress.person_address_public_place = success.data.data.public_place;
				self.queryDistrict = success.data.data.district_name;
				self.newAddress.district_id = success.data.data.district_id;
				self.newAddress.district = new District({
					district_id: success.data.data.district_id, 
					district_name: success.data.data.district_name
				});
				self.queryCity = success.data.data.city_name;
				self.newAddress.city_id = success.data.data.city_id;
				self.newAddress.city = new City({ 
					city_id: success.data.data.city_id, 
					city_name: success.data.data.city_name
				});
				self.newAddress.uf_id = success.data.data.uf_id;
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		function clear() {
			self.newAddress           = new Address();
			self.newAddress.person_id = _personId;

			/* Carrega e insere a propriedade key */
			angular.forEach(Globals.get('contact-types'), function(value, key) {
				self.newAddress.person_address_contact.push(new Contact({
					person_address_contact_type_id: value.contact_type_id,
					person_address_contact_label: value.contact_type_label,
					key: key
				}));
			});
			/* Ordena pela propriedade key */
			self.newAddress.person_address_contact = self.newAddress.person_address_contact.sort(function(a, b) {
				return a.key < b.key ? -1 : 1;
			});

			self.queryDistrict = null;
			self.queryCity = null;
			searchDistrict();
			searchCity();
		}

		function submit() {
			$rootScope.loading.load();
			providerAddress.save(self.newAddress).then(function(success) {
				self.newAddress.person_address_code = success.data.address_code;
				constants.debug && console.log('$emit: newAddress', self.newAddress);
				$scope.$emit('newAddress', self.newAddress);
				clear();
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

		function updateSearch(e) {
			e.stopPropagation();
		}

		function searchDistrict() {
			var options = {
				limit: 10
			};

			providerDistrict.getByName(self.queryDistrict, options).then(function(success) {
				self.queryDistrictResult = success.data.map(function(d) { return new District(d) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		function searchCity() {
			var options = {
				limit: 10
			};

			providerCity.getByName(self.queryCity, options).then(function(success) {
				self.queryCityResult = success.data.map(function(c) { return new City(c) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		function districtChanged(id) {
			self.newAddress.district_id = id;
		}

		function cityChanged(city_id, uf_id) {
			self.newAddress.city_id = city_id;
			self.newAddress.uf_id = uf_id;
		}

		function icmsChanged() {
			if (self.newAddress.icms_type == 2) {
				self.newAddress.person_address_ie = 'ISENTO';
			} else {
				if (self.newAddress.person_address_ie == 'ISENTO')
					self.newAddress.person_address_ie = null;
			}
		}

		function focusOn(selector) {
			jQuery(selector).focus().select();
		}

	}

}());