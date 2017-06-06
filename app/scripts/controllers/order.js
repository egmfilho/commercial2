/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 17:55:30
*/
(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('OrderCtrl', OrderCtrl);

	OrderCtrl.$inject = [ '$rootScope', '$scope', '$location', '$q', '$mdPanel', 'Constants', 'ProviderPerson', 'Person', 'ElectronWindow' ];

	function OrderCtrl($rootScope, $scope, $location, $q, $mdPanel, constants, providerPerson, Person, ElectronWindow) {

		var self = this;

		$scope.debug = constants.debug;

		self.budget =  {
			seller: new Person(),
			customer: new Person()
		};

		self.getPersonByCode   = getPersonByCode;
		self.getPersonByName   = getPersonByName;	
		self.getSellerByCode   = getSellerByCode;
		self.getCustomerByCode = getCustomerByCode;
		self.scrollTo          = scrollTo;
		self.savePDF 		   = savePDF;
		
		self.editItemMenu      = editItemMenu;
		self.showDialog        = showDialog;

		// ******************************
		// Methods declaration
		// ******************************

		/**
		* Pesquisa pessoa pelo codigo.
		* @param {string} code - O codigo da pessoa.
		* @param {string} category - Categoria ('Cliente' ou 'Vendedor').
		*/
		function getPersonByCode(code, category, options) {
			if (!code) return;

			providerPerson.getByCode(code, category, options).then(function(success) {
				self.budget.customer = new Person(success.data);
			}, function(error) {
				constants.debug && console.log(error);
			});
		}

		/**
		* Pesquisa pessoa pelo nome.
		* @param {string} name - O nome da pessoa.
		* @param {string} category - Categoria ('Cliente' ou 'Vendedor').
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
		* @param {(string)} code - O codio do vendedor.
		*/
		function getSellerByCode(code) {
			return getPersonByCode(code, '0000000004,000000000R');
		}

		/**
		* Pesquisa o cliente pelo codigo.
		* @param {(string)} code - O codio do cliente.
		*/
		function getCustomerByCode(code) {
			if (code == self.budget.customer.code) 
				return;

			var options = { getAddress: true };
			
			return getPersonByCode(code, '0000000005', options);
		}

		/**
		* Rola a tela ate o elemento informado.
		* @param {(string|element)} selector - O elemento para qual o scroll vai rolar.
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




		$scope.teste = function() {
			console.log('blur');
			$scope.tempCustomer = self.budget.customer;
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