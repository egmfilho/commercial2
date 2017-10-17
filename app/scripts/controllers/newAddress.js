/*
* @Author: egmfilho
* @Date:   2017-06-08 09:24:23
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-21 11:32:10
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
		'ModalCep',
		'ProviderCep',
		'Cep',
		'ProviderDistrict', 
		'District', 
		'ProviderCity', 
		'City',
		'Contact', 
		'Globals',
		'Constants' 
	];

	function NewAddressCtrl($rootScope, $scope, $http, providerAddress, Address, ModalCep, providerCep, Cep, providerDistrict, District, providerCity, City, Contact, Globals, constants) {

		var self = this, _personId = null, _contacts = [];

		self.types               = Globals.get('public-place-types');
		
		self.newAddress          = new Address();

		self.getCep              = getCep;
		self.showModalCep        = showModalCep;
		self.queryDistrict       = null;
		self.queryDistrictResult = [ ];
		self.queryCity           = null;
		self.queryCityResult     = [ ];

		self.clear 	             = clear;
		self.submit              = submit;
		self.updateSearch        = updateSearch;
		self.searchCity          = searchCity;
		self.searchDistrict      = searchDistrict;
		self.districtChanged     = districtChanged;
		self.cityChanged         = cityChanged;
		self.icmsChanged         = icmsChanged;
		self.focusOn             = focusOn;

		$scope.$on('modalCustomerAddress', function() {
			constants.debug && console.log('new address controller loaded!');

			$http({
				method: 'GET',
				url: Globals.api.get().address + 'contact_type.php?action=getList'
			}).then(function(success) {
				success.data.data.map(function(c) {
					_contacts.push(new Contact({
						person_address_contact_type_id: c.contact_type_id,
						person_address_contact_label: c.contact_type_name
					}));
				});

				clear();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.customDialog().showMessage('Erro', error.data.data.status.description);
			});
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

		function setCepFromSource(source) {
			self.newAddress.merge(source);
			self.queryDistrict = source.district.district_name;
			searchDistrict();
			self.queryCity = source.city.city_name;
			searchCity();
		}

		// ******************************
		// Methods declaration
		// ******************************

		function getCep(cep) {
			if (!cep) return;

			$rootScope.loading.load();
			providerCep.getByCode(cep).then(function(success) {
				setCepFromSource(new Cep(success.data).toAddress());
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
			});
		}

		function showModalCep() {
			ModalCep.show().then(function(success) {
				setCepFromSource(success);
			}, function(error) { });
		}

		function clear() {
			self.newAddress           = new Address();
			self.newAddress.person_id = _personId;

			/* Carrega os tipos de contatos */
			self.newAddress.person_address_contact = JSON.parse(JSON.stringify(_contacts));

			self.queryDistrict = null;
			self.queryCity = null;
			self.searchDistrict();
			self.searchCity();
		}

		function submit() {
			if (!self.newAddress.person_address_cep) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe o CEP!');
				return;
			}

			if (!self.newAddress.person_address_type) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe o tipo do logradouro!');
				return;
			}

			if (!self.newAddress.person_address_public_place) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe o logradouro!');
				return;
			}

			if (!self.newAddress.person_address_number) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe o número do endereço!');
				return;
			}

			if (!self.newAddress.district_id) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe o bairro!');
				return;
			}

			if (!self.newAddress.city_id) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe a cidade!');
				return;
			}

			if (!self.newAddress.person_address_ie && self.newAddress.icms_type != Globals.get('elective-icms-type').code) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe a inscrição estadual!');
				return;
			}

			$rootScope.loading.load();
			self.newAddress.person_address_contact = self.newAddress.person_address_contact.filter(function(c) {
				return !!c.person_address_contact_value;
			});
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

})();