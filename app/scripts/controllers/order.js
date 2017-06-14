/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-14 17:56:23
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('OrderCtrl', OrderCtrl);

	OrderCtrl.$inject = [ 
		'$rootScope', 
		'$scope', 
		'$timeout',
		'$location', 
		'$q', 
		'$mdPanel', 
		'Constants', 
		'ProviderPerson', 
		'Person',
		'Address', 
		'ProviderProduct', 
		'Product', 
		'OrderItem',
		'UserCompany',
		'ElectronWindow' 
	];

	function OrderCtrl($rootScope, $scope, $timeout, $location, $q, $mdPanel, constants, providerPerson, Person, Address, providerProduct, Product, OrderItem, UserCompany, ElectronWindow) {

		var self = this;

		$scope.debug = constants.debug;
		
		self.selectCompany = selectCompany;

		self.internal = {
			personCategories: {
				seller: '0000000004,000000000R',
				customer: '0000000005'
			},
			tempSeller: null,
			tempCustomer: null,
			tempAddress: new Address(),
			tempProduct: null,
			tempItem: new OrderItem(),
			blurSeller: blurSeller,
			blurCustomer: blurCustomer,
			blurItem: blurItem,
			address: {
				selectedTabIndex: 0
			}
		};

		self.budget = {
			seller: new Person(),
			customer: new Person(),
			companyId: null,
			items: [ ],
			deliveryAddressId: null,
			setDeliveryAddressId: function(id) { self.budget.deliveryAddressId = id; },
			getDeliveryAddress: function() { return self.budget.customer.person_address.find(function(a) { return a.person_address_code == self.budget.deliveryAddressId }) }
		};


		self.newCustomer       = newCustomer;
		self.clearSeller       = clearSeller;
		self.clearItems        = clearItems;
		self.clearCustomer     = clearCustomer;
		self.clearNote         = clearNote;
		self.getPersonByCode   = getPersonByCode;
		self.getPersonByName   = getPersonByName;	
		self.getSellerByCode   = getSellerByCode;
		self.getSellerByName   = getSellerByName;
		self.getCustomerByCode = getCustomerByCode;
		self.getCustomerByName = getCustomerByName;
		self.getProductByCode  = getProductByCode;
		self.getProductByName  = getProductByName;
		self.scrollTo          = scrollTo;
		self.focusOn           = focusOn;
		self.savePDF           = savePDF;

		self.editItemMenu      = editItemMenu;
		self.showEditItemModal = showEditItemModal;
		self.showDialog        = showDialog;
		self.addItem           = addItem;
		self.removeItem        = removeItem;

		$scope.$on('$viewContentLoaded', function() {
			if (!self.budget.companyId) {
				selectCompany();
			}
			$scope.$broadcast('viewContentLoaded');
		});

		$scope.$on('newAddress', function() {
			self.internal.address.selectedTabIndex = 0;
		});

		// ******************************
		// Methods declaration
		// ******************************

		/**
		* Abre uma janela para informar a loja quando 
		* o usuario possui mais de uma loja vinculada.
		*/
		function selectCompany() {
			var dialog = $rootScope.customDialog(),
				controller = function() { },
				options,
				_companies = $rootScope['user-companies-raw'].map(function(c) {
					return new UserCompany(c);
				});

			controller.prototype = {
				companies: _companies,
				companyId: _companies[0].company_id
			};

			options = { 
				hasBackdrop: true,
				clickOutsideToClose: false,
				escapeToClose: false,
				zIndex: 1
			};

			dialog.showTemplate('Informe a empresa', './partials/modalSelectCompany.html', controller, options)
				.then(function(res) {
					self.budget.companyId = res;
					constants.debug && console.log('companyId: ', self.budget.companyId);
				}, function(error) { });
		}

		/**
		* Recoloca o nome do vendedor no autocomplete quando 
		* o usuario desiste da pesquisa.
		*/
		function blurSeller() { 
			if (self.budget.seller.person_id) 
				self.internal.tempSeller = new Person(self.budget.seller);
		}

		/**
		* Recoloca o nome do cliente no autocomplete quando 
		* o usuario desiste da pesquisa.
		*/
		function blurCustomer() { 
			if (self.budget.customer.person_id) 
				self.internal.tempCustomer = new Person(self.budget.customer);
		}

		/**
		* Recoloca o nome do produto no autocomplete quando 
		* o usuario desiste da pesquisa.
		*/
		function blurItem() { 
			if (self.internal.tempItem.product.product_id) 
				self.internal.tempProduct = new Product(self.internal.tempItem.product);
		}

		/**
		 *	Abre o modal de cadastro de novo cliente.
		 */
		function newCustomer() {
			var dialog = $rootScope.customDialog(),
				controller = function () { };

			controller.prototype = {
				newCustomer: new Person(),
				newAddress: new Address(),
				_showCloseButton: true
			};

			dialog.showTemplate('Novo cliente', './partials/modalNewPerson.html', controller)
				.then(function(res) {
					console.log(res);
				}, function(res) { });
		}

		/**
		* Limpa os campos da sessao de vendedor.
		*/
		function clearSeller() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos?').then(function() {
				self.budget.seller = new Person();
				self.internal.tempSeller = null;
				jQuery('input[ng-value="order.budget.seller.person_code"]').val('');
			}, function() { });
		}

		/**
		* Limpa os campos da sessao de produtos e esvazia a lista de itens.
		*/
		function clearItems() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos e esvaziar a lista de itens?').then(function() {
				self.budget.items = [ ];
				self.internal.tempItem = new OrderItem();
				self.internal.tempProduct = null;
				jQuery('input[ng-value="order.internal.tempItem.product.product_code"]').val('');
			}, function() { });
		}

		/**
		* Limpa os campos da sessao de vendedor.
		*/
		function clearCustomer() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos?').then(function() {
				self.budget.customer = new Person();
				self.internal.tempCustomer = null;	
				self.internal.tempAddress = new Address();
				jQuery('input[ng-value="order.budget.customer.person_code"]').val('');
			}, function() { });
		}

		/**
		* Limpa o campo de observacoes.
		*/
		function clearNote() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar o campo?').then(function() {
				
			}, function() { });
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
			if (!code) {
				self.focusOn('input[name="autocompleteSeller"]');
				return;
			}

			if (code == self.budget.seller.person_code || !parseInt(code))
				return;

			$rootScope.loading.load();
			getPersonByCode(code, self.internal.personCategories.seller).then(function(success) {
				self.budget.seller = new Person(success.data);
				self.internal.tempSeller = new Person(success.data);
				self.scrollTo('section[name="products"]');
				self.focusOn('input[name="product-code"]');
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
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
			if (!code) {
				self.focusOn('input[name="autocompleteCustomer"]');
				return;
			}

			if (code == self.budget.customer.person_code || !parseInt(code))
				return;

			var options = { getAddress: true };
			
			$rootScope.loading.load();
			getPersonByCode(code, self.internal.personCategories.customer, options).then(function(success) {
				self.budget.customer = new Person(success.data);
				self.budget.deliveryAddressId = null;
				self.internal.tempCustomer = new Person(success.data);
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
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
		* Pesquisa o produto pelo codigo.
		* @param {string} code - O codio do produto.
		*/
		function getProductByCode(code) {
			if (!code) {
				constants.debug && console.log('Sem codigo informado');
				self.focusOn('input[name="autocompleteProduct"]');
				return;
			}

			if (code == self.internal.tempItem.product.product_code || !parseInt(code)) {
				return;
			}

			$rootScope.loading.load();
			constants.debug && console.log('buscando produto por codigo', code);
			providerProduct.getByCode(code, self.budget.companyId, '00A0000001', { limit: 10 }).then(function(success) {
				self.internal.tempProduct = new Product(success.data);
				self.internal.tempItem.setProduct(new Product(success.data));
				self.focusOn('input[name="amount"]');
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		/**
		* Pesquisa produtos pelo nome.
		* @param {string} name - O nome do produto.
		* @returns {object} - Uma promise com o resultado.
		*/
		function getProductByName(name) {
			var deferred = $q.defer(),
				options  = {
					limit: 10,
					getPrice: true,
					getStock: true,
					getUnit: true
				};

			if (!name || name.length < 3)
				return [ ];

			providerProduct.getByName(name, self.budget.companyId, '00A0000001', options).then(function(success) {
				deferred.resolve(success.data.map(function(p) { return new Product(p); }));
			}, function(error) {
				constants.debug && console.log(error);
				deferred.resolve([ ]);
			});

			return deferred.promise;
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
		* Foca e seleciona o conteudo do elemento informado.
		* @param {(string|object)} selector - O elemento para qual focar.
		*/
		function focusOn(selector) {
			$timeout(function() {
				constants.debug && console.log('focus on', selector);
				jQuery(selector)[0].focus();
			}, 100);
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

		function showEditItemModal(item) {
			var dialog = $rootScope.customDialog(),
				controller = function() { };

			controller.prototype = {
				_showCloseButton: true,
				item: new OrderItem(item)
			};

			dialog.showTemplate('Editar', './partials/modalEditItem.html', controller)
				.then(function(res) {
					var index = self.budget.items.indexOf(item);
					self.budget.items[index] = new OrderItem(res);
				}, function(error) { });
		}

		function showDialog() {
			return;

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

		function addItem() {
			if (self.internal.tempItem.product && self.internal.tempItem.product.product_id) {
				if (self.internal.tempItem.order_item_amount > 0) {
					self.budget.items.push(new OrderItem(self.internal.tempItem));
					var container = jQuery('.container-table');
					container.animate({ scrollTop: container.height() });
				}
				self.internal.tempProduct = null;
				self.internal.tempItem = new OrderItem();
			}

			self.focusOn('input[name="product-code"]');
		}

		function removeItem(item) {
			if (!item)
				return;

			var message = 'Deseja remover o item: ';
			message += item.product.product_code + ' - ';
			message += item.product.product_name + '?';

			$rootScope.customDialog().showConfirm('Aviso', message)
				.then(function(success) {
					constants.debug && console.log('resolved');
					var index = self.budget.items.indexOf(item);
					self.budget.items.splice(index, 1);
				}, function(error) { 
					constants.debug && console.log('rejected');
				});
		}
	}
}());