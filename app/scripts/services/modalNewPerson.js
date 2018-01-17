/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-08-15 11:17:54
 * @Last Modified by: egmfilho
 * @Last Modified time: 2018-01-17 17:41:36
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalNewPerson', ['$rootScope', '$http', '$q', '$timeout', 'Constants', 'Globals', 'ModalPersonCheck', 'DocumentValidator', function($rootScope, $http, $q, $timeout, constants, Globals, ModalPersonCheck, DocumentValidator) {


			function show() {
				var controller = function(providerPerson, Person, Address, Contact, providerCep, Cep, ModalCep, providerDistrict, District, providerCity, City, Receita) {
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
					};

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
						} else {
							if (scope.customer.person_cpf) {
								if (!DocumentValidator(scope.customer.person_cpf)) {
									$rootScope.customDialog().showMessage('Erro', 'CPF inválido!');
									return;
								}
							}

							if (scope.customer.person_cnpj) {
								if (!DocumentValidator(scope.customer.person_cnpj)) {
									$rootScope.customDialog().showMessage('Erro', 'CNPJ inválido!');
									return;
								}
							}
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

						if (scope.customer.person_address[0].person_address_icms_type == 1 && !scope.customer.person_address[0].person_address_ie) {
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
							$timeout(function() { jQuery("input[name='numero']").focus(); }, 250);
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
						});
					};

					this.searchDistrict = function(options) {
						var deferred = $q.defer();

						if (options && options.clearModel)
							this.customer.person_address[0].setDistrict(new District());

						var options = {
							limit: 10
						};

						providerDistrict.getByName(scope.queryDistrict, options).then(function(success) {
							scope.queryDistrictResult = success.data.map(function(d) { return new District(d) });
							deferred.resolve(scope.queryDistrictResult);
						}, function(error) {
							constants.debug && console.log(error);
							deferred.reject(error);
						});

						return deferred.promise;
					};

					this.searchCity = function(options) {
						var deferred = $q.defer();

						if (options && options.clearModel)
							this.customer.person_address[0].setCity(new City());

						var options = {
							limit: 10
						};

						providerCity.getByName(scope.queryCity, options).then(function(success) {
							scope.queryCityResult = success.data.map(function(c) { return new City(c) });
							deferred.resolve(scope.queryCityResult);
						}, function(error) {
							constants.debug && console.log(error);
							deferred.reject(error);
						});

						return deferred.promise;
					};

					this.searchCNPJ = function(cnpj) {
						if (!cnpj) return;

						if (!DocumentValidator(cnpj)) {
							$rootScope.customDialog().showMessage('Erro', 'CNPJ inválido!');
							return;
						}
						
						var controller = function() {
							var vm = this;

							this._showCloseButton = true;
							this.data = { };
							this.confirm = function() {
								vm._close(vm.data);
							};

							$rootScope.loading.load();
							Receita.search(cnpj).then(function(success) {
								console.log(success);
								vm.data = success.data;
								$rootScope.loading.unload();

								if (success.data.status == 'ERROR') {
									vm._cancel();
									$rootScope.customDialog().showMessage('Erro', success.data.message);
								}
							}, function(error) {
								$rootScope.loading.unload();
							});
						};

						var options = {
							width: 600,
							hasBackdrop: true
						};

						$rootScope.customDialog().showTemplate('Commercial', './partials/modalReceita.html', controller, options)
							.then(function(data) {
								scope.customer.person_name = data.nome;
								scope.customer.person_address[0].person_address_number = data.numero;
								scope.customer.person_address[0].person_address_note = data.complemento;
								
								// PEGANDO INDEX PELO LABEL POIS NAO ESTA MAIS VINDO O ID NO GET DO CONFIG.PHP
								var telIndex = scope.customer.person_address[0].person_address_contact.findIndex(function(c){
									return c.person_address_contact_label == 'Telefone';
								});
								scope.customer.person_address[0].person_address_contact[telIndex].person_address_contact_value = data.telefone;

								// PEGANDO INDEX PELO LABEL POIS NAO ESTA MAIS VINDO O ID NO GET DO CONFIG.PHP
								var mailIndex = scope.customer.person_address[0].person_address_contact.findIndex(function(c){
									return c.person_address_contact_label == 'Email';
								});
								scope.customer.person_address[0].person_address_contact[mailIndex].person_address_contact_value = data.email;

								// CHECA SE O CEP JA ESTÁ CADASTRADO NO SISTEMA E PUXA OS DADOS
								// SENAO USA OS DADOS QUE VIERAM DA RECEITA.
								// OBS.: EXISTEM CEPS CADASTRADOS ERRADOS NO BANCO DE DADOS LOCAL
								// providerCep.getByCode(data.cep.replace(/[.]/g, '')).then(function(success) {
									// setCepFromSource(new Cep(success.data).toAddress());
								// }, function(error) {
									scope.customer.person_address[0].person_address_cep = data.cep.replace(/[.]/g, '');
									scope.customer.person_address[0].person_address_public_place = data.logradouro;
									scope.queryDistrict = data.bairro;
									scope.searchDistrict().then(function(districts) {
										scope.customer.person_address[0].setDistrict(districts[0]);
									});
									scope.queryCity = data.municipio;
									scope.searchCity().then(function(cities){
										scope.customer.person_address[0].setCity(cities[0]);
									});
								// });
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

				controller.$inject = [ 'ProviderPerson', 'Person', 'Address', 'Contact', 'ProviderCep', 'Cep', 'ModalCep', 'ProviderDistrict', 'District', 'ProviderCity', 'City', 'Receita' ];

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