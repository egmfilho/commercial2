/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 10:42:19
*/
(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('OrderCtrl', OrderCtrl);

	OrderCtrl.$inject = [ '$rootScope', '$scope', '$location', '$q', '$mdPanel', 'Constants', 'ProviderPerson', 'Person', 'ElectronWindow' ];

	function OrderCtrl($rootScope, $scope, $location, $q, $mdPanel, constants, providerPerson, Person, ElectronWindow) {

		var self = this;

		$scope.debug = constants.debug;

		self.internal = {
			personCategories: {
				seller: '0000000004,000000000R',
				customer: '0000000005'
			},
			tempSeller: null,
			tempCustomer: null,			
			blurSeller: blurSeller,
			blurCustomer: blurCustomer,
			address: {
				selectedTabIndex: 0
			}
		};

		self.budget = {
			seller: new Person(),
			customer: new Person(),
			deliveryAddressId: null,
			setDeliveryAddressId: function(id) { self.budget.deliveryAddressId = id; },
			getDeliveryAddress: function() { return self.budget.customer.person_address.find(function(a) { return a.person_address_code == self.budget.deliveryAddressId }) }
		};

		self.getPersonByCode   = getPersonByCode;
		self.getPersonByName   = getPersonByName;	
		self.getSellerByCode   = getSellerByCode;
		self.getSellerByName   = getSellerByName;
		self.getCustomerByCode = getCustomerByCode;
		self.getCustomerByName = getCustomerByName;
		self.scrollTo          = scrollTo;
		self.savePDF 		   = savePDF;
		
		$scope.$on('newAddress', function() {
			self.internal.address.selectedTabIndex = 0;
		});


		self.editItemMenu      = editItemMenu;
		self.showDialog        = showDialog;

		// ******************************
		// Methods declaration
		// ******************************

		/**
		* Recoloca o nome do vendedor no autocomplete quando 
		* o usuario desiste da pesquisa.
		*/
		function blurSeller() { 
			if (self.budget.seller.person_id) 
				self.internal.tempSeller = new Person(self.budget.seller) 
		}

		/**
		* Recoloca o nome do cliente no autocomplete quando 
		* o usuario desiste da pesquisa.
		*/
		function blurCustomer() { 
			if (self.budget.customer.person_id) 
				self.internal.tempCustomer = new Person(self.budget.customer) 
		}

		/**
		* Pesquisa pessoa pelo codigo.
		* @param {string} code - O codigo da pessoa.
		* @param {string} category - Categoria ('Cliente' ou 'Vendedor').
		* @returns {object} - Uma promise com o resultado.
		*/
		function getPersonByCode(code, category, options) {
			if (!code) return;

			return providerPerson.getByCode(code, category, options);
		}

		/**
		* Pesquisa pessoa pelo nome.
		* @param {string} name - O nome da pessoa.
		* @param {string} category - Categoria ('Cliente' ou 'Vendedor').
		* @returns {object} - Uma promise com o resultado.
		*/
		function getPersonByName(name, category) {
			var deferred = $q.defer();

			if (!name || !category || name.length < 3)
				return [ ];

			providerPerson.getByName(name, category, { limit: 10 }).then(function(success) {
				deferred.resolve(success.data.map(function(p) { return new Person(p); }));
			}, function(error) {
				constants.debug && console.log(error);
				deferred.resolve([ ]);
			});

			return deferred.promise;
		}

		/**
		* Pesquisa o vendedor pelo codigo.
		* @param {string} code - O codio do vendedor.
		*/
		function getSellerByCode(code) {
			if (!code || code == self.budget.seller.person_code) 
				return;

			console.log('get', code);

			getPersonByCode(code, self.internal.personCategories.seller).then(function(success) {
				self.budget.seller = new Person(success.data);
				self.internal.tempSeller = new Person(success.data);
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		/**
		* Pesquisa vendedores pelo nome.
		* @param {string} name - O nome do vendedor.
		* @returns {object} - Uma promise com o resultado.
		*/
		function getSellerByName(name) {
			return getPersonByName(name, self.internal.personCategories.seller);
		}

		/**
		* Pesquisa o cliente pelo codigo.
		* @param {string} code - O codio do cliente.
		*/
		function getCustomerByCode(code) {
			if (!code || code == self.budget.customer.person_code) 
				return;

			var options = { getAddress: true };
			
			getPersonByCode(code, self.internal.personCategories.customer, options).then(function(success) {
				self.budget.customer = new Person(success.data);
				self.internal.tempCustomer = new Person(success.data);
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		/**
		* Pesquisa clientes pelo nome.
		* @param {string} name - O nome do cliente.
		* @returns {object} - Uma promise com o resultado.
		*/
		function getCustomerByName(name) {
			return getPersonByName(name, self.internal.personCategories.customer);
		}

		/**
		* Rola a tela ate o elemento informado.
		* @param {(string|object)} selector - O elemento para qual o scroll vai rolar.
		*/
		function scrollTo(selector) {
			var container = jQuery('#order'),
				target    = jQuery(selector)[0].offsetTop;

			container.animate({
				scrollTop: target - 5
			});
		}

		/**
		* Instancia uma nova janela e chama o dialogo para salvar o PDF.
		*/
		function savePDF() {
			ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/1?action=pdf');
		}

		/**
		* Instancia uma nova janela e chama o dialogo de impressao.
		*/
		function print() {
			ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/1?action=print');
		}






		function editItemMenu($mdMenu, event) {
			$mdMenu.open(event);
		}

		function showDialog() {

			var dialog = $rootScope.customDialog();

			dialog.showTemplate('Template', './partials/modalNewPerson.html', ['Person', 'mdPanelRef', function(Person, mdPanelRef) {
				this.customer = new Person();

				this.teste = function() {
					alert('Tell me your secrets...');
				};

				this.positiveButton = {
					label: 'Texas',
					action: function() {
						mdPanelRef.close();
					}
				};
			}]);
		}
	}
}());