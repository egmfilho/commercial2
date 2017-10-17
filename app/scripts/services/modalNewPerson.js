/*
* @Author: egmfilho
* @Date:   2017-08-15 11:17:54
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-30 17:13:37
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalNewPerson', ['$rootScope', '$http', 'Constants', 'Globals', 'ModalPersonCheck', function($rootScope, $http, constants, Globals, ModalPersonCheck) {


			function show() {
				var controller = function(providerPerson, Person, Address, Contact, providerCep, Cep, ModalCep, providerDistrict, District, providerCity, City) {
					var scope = this;

					this._showCloseButton = true;

					this.addressTypes = Globals.get('public-place-types');
					this.category = Globals.get('person-categories').customer;
					this.customer = new Person({
						person_address: [ new Address() ]
					});
					this.queryDistrict = null;
					this.queryDistrictResult = [ ];
					this.queryCity = null;
					this.queryCityResult = [ ];

					function setCepFromSource(source) {
						scope.customer.person_address[0].merge(source);
						scope.queryDistrict = source.district.district_name;
						scope.searchDistrict();
						scope.queryCity = source.city.city_name;
						scope.searchCity();
					}

					this.showModalPersonCheck = function(title, people) {
						return ModalPersonCheck.show(title, people, scope.category);
					}

					this.checkDocument = function() {
						providerPerson.check(this.customer.person_cpf, this.customer.person_cnpj, this.category)
							.then(function(success) {
								scope.showModalPersonCheck('Aviso',success.data).then(function(success){
									scope._close(success);
								}, function(error){ });
							}, function(error) {
								if (error.status != 404 && error.status != 417)
									$rootScope.customDialog().showMessage('Erro', error.data.status.description);
							});
					};

					this.activateAndClose = function(id) {

					};

					this.save = function() {
						if (!scope.customer.person_name) {
							$rootScope.customDialog().showMessage('Erro', 'Informe o nome do cliente!');
							return;
						}

						if (!scope.customer.person_cpf && !scope.customer.person_cnpj) {
							$rootScope.customDialog().showMessage('Erro', 'Informe o ' + (scope.customer.person_type == 'F' ? 'CPF' : 'CNPJ') + ' do cliente!');
							return;
						}

						if (!scope.customer.person_address[0].person_address_cep) {
							$rootScope.customDialog().showMessage('Erro', 'Informe o CEP do cliente!');
							return;
						}

						if (!scope.customer.person_address[0].person_address_type || !scope.customer.person_address[0].person_address_public_place || !scope.customer.person_address[0].person_address_number) {
							$rootScope.customDialog().showMessage('Erro', 'Informe corretamente o endereço do cliente!');
							return;
						}

						if (!scope.customer.person_address[0].district_id) {
							$rootScope.customDialog().showMessage('Erro', 'Informe o bairro!');
							return;
						}

						if (!scope.customer.person_address[0].city_id) {
							$rootScope.customDialog().showMessage('Erro', 'Informe a cidade!');
							return;
						}

						if (scope.customer.person_address[0].icms_type == 1 && !scope.customer.person_address[0].person_address_ie) {
							$rootScope.customDialog().showMessage('Erro', 'Informe a inscrição estadual!');
							return;
						}

						var filtered = new Person(scope.customer);
						filtered.person_credit = null;
						filtered.person_credit_limit = null;
						filtered.queryable = null;
						filtered.person_address[0].person_address_contact = scope.customer.person_address[0].person_address_contact.filter(function(c) {
							return !!c.person_address_contact_value;
						}); 

						providerPerson.save(filtered, Globals.get('person-categories').customer).then(function(success) {
							$rootScope.loading.unload();
							scope._close(success.data);
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Aviso!', error.data.status.description);
						});
					};

					this.focusOn = function(selector) {
						jQuery(selector).focus().select();
					};

					this.showModalCep = function() {
						ModalCep.show().then(function(success) {
							success && setCepFromSource(success);
						}, function(error) { });
					};

					this.getCep = function(code) {
						if (!code) return;

						$rootScope.loading.load();
						providerCep.getByCode(code).then(function(success) {
							setCepFromSource(new Cep(success.data).toAddress());
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
						});
					};

					this.searchDistrict = function() {
						var options = {
							limit: 10
						};

						providerDistrict.getByName(scope.queryDistrict, options).then(function(success) {
							scope.queryDistrictResult = success.data.map(function(d) { return new District(d) });
						}, function(error) {
							constants.debug && console.log(error);
						});
					};

					this.searchCity = function() {
						var options = {
							limit: 10
						};

						providerCity.getByName(scope.queryCity, options).then(function(success) {
							scope.queryCityResult = success.data.map(function(c) { return new City(c) });
						}, function(error) {
							constants.debug && console.log(error);
						});
					};

					// Inicializador
					(function() {
						scope.searchDistrict();
						scope.searchCity();

						$rootScope.loading.load();
						$http({
							method: 'GET',
							url: Globals.api.get().address + 'contact_type.php?action=getList'
						}).then(function(success) {
							success.data.data.map(function(c) {
								scope.customer.person_address[0].person_address_contact.push(new Contact({
									person_address_contact_type_id: c.contact_type_id,
									person_address_contact_label: c.contact_type_name
								}));
							});
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.data.status.description);
						});
					})();
				};

				controller.$inject = [ 'ProviderPerson', 'Person', 'Address', 'Contact', 'ProviderCep', 'Cep', 'ModalCep', 'ProviderDistrict', 'District', 'ProviderCity', 'City' ];

				return $rootScope.customDialog().showTemplate('Novo cliente', './partials/modalNewPerson.html', controller, {
					hasBackdrop: false,
					innerDialog: true,
					escapeToClose: false,
					zIndex: 1,
					width: 900
				});
			}

			return {
				show: show
			};

		}]);

})();