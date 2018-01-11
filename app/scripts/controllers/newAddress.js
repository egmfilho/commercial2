/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-08 09:24:23
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-07 10:23:04
 */

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('NewAddressCtrl', NewAddressCtrl);

	NewAddressCtrl.$inject = [ 
		'$rootScope',
		'$scope', 
		'$http',
		'$timeout',
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

	function NewAddressCtrl($rootScope, $scope, $http, $timeout, providerAddress, Address, ModalCep, providerCep, Cep, providerDistrict, District, providerCity, City, Contact, Globals, constants) {

		var self = this, _personId = null, _contacts = [], _action = 'add';

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
		self.cancel              = cancel;
		self.updateSearch        = updateSearch;
		self.searchCity          = searchCity;
		self.searchDistrict      = searchDistrict;
		self.districtChanged     = districtChanged;
		self.cityChanged         = cityChanged;
		self.icmsChanged         = icmsChanged;
		self.focusOn             = focusOn;

		self.labelButton         = 'Cadastrar';

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

				clear('add');
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.customDialog().showMessage('Erro', error.data.data.status.description);
			});
		});

		$scope.$on('customerAdded', function(event, args) {
			_personId = args.person_id;
			self.newAddress.person_id = _personId;
			self.labelButton = 'Cadastrar';
			clear('add');
		});

		$scope.$on('modalCustomerAddress', function(event, args) {
			_personId = args.person_id;
			self.newAddress.person_id = _personId;
			self.labelButton = 'Cadastrar';
			clear('add');
		});

		$scope.$on('editAddress', function(event, args) {
			clear('edit');
			self.labelButton = 'Atualizar';
			self.newAddress.merge(args);
			
			// junta o array dos contatos vazio com os contatos do cadastro
			self.newAddress.person_address_contact = _contacts.map(function(c) {
				return self.newAddress.person_address_contact.find(function(x) { 
					return x.person_address_contact_type_id == c.person_address_contact_type_id 
				}) || new Contact(c);
			});
			
			self.queryDistrict = args.district.district_name;
			searchDistrict();
			self.queryCity = args.city.city_name;
			searchCity();
		});

		$scope.$on('newAddress', function(event, args) {
			clear('add');
			self.labelButton = 'Cadastrar';
		});

		$scope.$on('clearAddress', function(event, args) {
			clear('add');
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
				$timeout(function() { jQuery("input[name='numero']").focus(); }, 250);
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

		function clear(action) {
			self.newAddress           = new Address();
			self.newAddress.person_id = _personId;
			_action    = action;

			/* Carrega os tipos de contatos */
			self.newAddress.person_address_contact = JSON.parse(JSON.stringify(_contacts));

			self.queryDistrict = null;
			self.queryCity = null;

			if (action == 'add') {
				self.searchDistrict();
				self.searchCity();
			}
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

			if (!self.newAddress.person_address_ie && self.newAddress.person_address_icms_type != Globals.get('elective-icms-type').code) {
				$rootScope.customDialog().showMessage('Aviso', 'Informe a inscrição estadual!');
				return;
			}

			$rootScope.loading.load();
			self.newAddress.person_address_contact = self.newAddress.person_address_contact.filter(function(c) {
				return !!c.person_address_contact_value;
			});

			/**
			 * Retaguarda espera a propriedade icms_type em vez da person_address_icms_type.
			 * Depois de corrigir na retaguarda (alterdata.api/public/person_address.php linha 35)
			 * remover a linha abaixo;
			 */
			self.newAddress.icms_type = self.newAddress.person_address_icms_type;

			providerAddress.save(self.newAddress).then(function(success) {
				self.newAddress.person_address_code = success.data.address_code;
				constants.debug && console.log('$emit: newAddress', self.newAddress);
				$scope.$emit(_action == 'add' ? 'newAddressRetorno' : 'editAddressRetorno', self.newAddress);
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

		function cancel() {
			clear('add');
			$scope.$emit('cancelAddress');
		}

		function updateSearch(e) {
			e.stopPropagation();
		}

		function searchDistrict(options) {
			if (options && options.clearModel)
				this.newAddress.setDistrict(new District());

			var options = {
				limit: 10
			};

			providerDistrict.getByName(self.queryDistrict, options).then(function(success) {
				self.queryDistrictResult = success.data.map(function(d) { return new District(d) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		function searchCity(options) {
			if (options && options.clearModel)
				this.newAddress.setCity(new City());

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
			if (self.newAddress.person_address_icms_type == 2) {
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