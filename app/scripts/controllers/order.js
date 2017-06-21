/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-21 14:04:41
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
		'Cookies',
		'Constants',
		'Globals',
		'Order', 
		'ProviderPerson', 
		'Person',
		'Address', 
		'ProviderProduct', 
		'Product', 
		'OrderItem',
		'UserCompany',
		'ElectronWindow' 
	];

	function OrderCtrl($rootScope, $scope, $timeout, $location, $q, $mdPanel, Cookies, constants, Globals, Order, providerPerson, Person, Address, providerProduct, Product, OrderItem, UserCompany, ElectronWindow) {

		var self = this;

		$scope.debug = constants.debug;
		
		self.selectCompany      = selectCompany;
		self.internal           = internalItems();
		self.budget             = new Order();
		self.newCustomer        = newCustomer;
		self.setCustomer        = setCustomer;
		self.clearSeller        = clearSeller;
		self.clearProductSearch = clearProductSearch;
		self.clearItems         = clearItems;
		self.clearCustomer      = clearCustomer;
		self.clearNote          = clearNote;
		self.getPersonByCode    = getPersonByCode;
		self.getPersonByName    = getPersonByName;
		self.getSellerByCode    = getSellerByCode;
		self.getSellerByName    = getSellerByName;
		self.getCustomerByCode  = getCustomerByCode;
		self.getCustomerByName  = getCustomerByName;
		self.getProductByCode   = getProductByCode;
		self.getProductByName   = getProductByName;
		self.priceTableChanged  = priceTableChanged;
		self.setItemAlDiscount  = setItemAlDiscount;
		self.setItemVlDiscount  = setItemVlDiscount;
		self.setTotalAlDiscount = setTotalAlDiscount;
		self.setTotalVlDiscount = setTotalVlDiscount;
		self.scrollTo           = scrollTo;
		self.focusOn            = focusOn;
		self.savePDF            = savePDF;
		self.showNotFound       = showNotFound;
		self.showAddressContact = showAddressContact;

		self.editItemMenu       = editItemMenu;
		self.showEditItemModal  = showEditItemModal;
		self.addItem            = addItem;
		self.removeItem         = removeItem;

		$scope.$on('$viewContentLoaded', function() {
			if (!self.budget.order_company_id) {
				selectCompany();
			}

			$timeout(function() { $scope.$broadcast('orderViewLoaded'); });
		});

		$scope.$on('newAddress', function(event, args) {
			constants.debug && console.log('$on: newAddress', args);
			self.budget.order_client.person_address.push(new Address(args));
			
			if (args.person_address_delivery == 'Y')
				self.budget.setDeliveryAddress(args);

			self.internal.address.selectedTabIndex = 0;
		});

		$scope.newOrder = function() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja descartar o orçamento atual?')
				.then(function(success) {
					self.budget = new Order();
					self.internal = internalItems();
				}, function(error) { });
		};

		$scope.open = function() {

		};

		$scope.save = function() {

		};

		function internalItems() {
			return {
				userPrices: Globals.get('user-prices-raw'),
				tempSeller: null,
				tempCustomer: null,
				tempAddress: new Address(),
				tempProduct: null,
				tempItem: new OrderItem({ price_id: getMainUserPriceId().price_id, user_price: getMainUserPriceId() }),
				tempItemAlDiscount: 0,
				tempItemVlDiscount: 0,
				blurSeller: blurSeller,
				blurCustomer: blurCustomer,
				blurItem: blurItem,
				address: {
					selectedTabIndex: 0
				}
			};
		}

		function getMainUserPriceId() {
			var i, uPrices = Globals.get('user-prices-raw');

			for (i = 0; i < uPrices.length; i++) {
				if (uPrices[i].user_price_main == 'Y')
					return uPrices[i];
			}

			return null;
		}

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
				_companies = Globals.get('user-companies-raw').map(function(c) {
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
					self.budget.order_company_id = res;
					constants.debug && console.log('companyId: ', self.budget.order_company_id);
				}, function(error) { });
		}

		/**
		 * Recoloca o nome do vendedor no autocomplete quando 
		 * o usuario desiste da pesquisa.
		 */
		function blurSeller() { 
			if (self.budget.order_seller.person_id) 
				self.internal.tempSeller = new Person(self.budget.order_seller);
		}

		/**
		 * Recoloca o nome do cliente no autocomplete quando 
		 * o usuario desiste da pesquisa.
		 */
		function blurCustomer() { 
			if (self.budget.order_client.person_id)
				self.internal.tempCustomer = new Person(self.budget.order_client);
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
		 * Abre o modal de cadastro de novo cliente.
		 * @param {object} person - O modal ja abre preenchido.
		 */
		function newCustomer(person) {
			var dialog = $rootScope.customDialog(),
				controller = function () { };

			controller.prototype = {
				newCustomer: new Person(person),
				_showCloseButton: true
			};

			dialog.showTemplate('Novo cliente', './partials/modalNewPerson.html', controller)
				.then(function(res) {
					$rootScope.loading.load();
					providerPerson.save(res, Globals.get('personCategories').customer).then(function(success) {
						self.setCustomer(angular.extend({ }, res, success.data));
						$rootScope.loading.unload();
					}, function(error) {
						$rootScope.loading.unload();
						newCustomer(res);
					});
				}, function(res) { });
		}

		/**
		 * Adiciona um cliente ao pedido.
		 * @param {object} person - O cliente a ser adicionado.
		 */	
		function setCustomer(person) {
			self.budget.setCustomer(new Person(person));
			self.budget.order_address_delivery_code = null;
			self.internal.tempCustomer = new Person(person);
			$scope.$broadcast('customerAdded', self.budget.order_client);
		}

		/**
		 * Limpa os campos da sessao de vendedor.
		 */
		function clearSeller() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos?').then(function() {
				self.budget.removeSeller();
				self.internal.tempSeller = null;
				jQuery('input[ng-value="order.budget.order_seller.person_code"]').val('');
			}, function() { });
		}

		/**
		 * Limpa os campos de pesquisa de produto.
		 */
		function clearProductSearch() {
			self.internal.tempItem = new OrderItem({ price_id: getMainUserPriceId().price_id, user_price: getMainUserPriceId() });
			self.internal.tempProduct = null;
			$scope.productQuery = '';
		}

		/**
		 * Limpa os campos da sessao de produtos e esvazia a lista de itens.
		 */
		function clearItems() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos e esvaziar a lista de itens?').then(function() {
				self.budget.order_items = [ ];
				clearProductSearch();
			}, function() { });
		}

		/**
		 * Limpa os campos da sessao de vendedor.
		 */
		function clearCustomer() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos?').then(function() {
				self.budget.removeCustomer();
				self.internal.tempCustomer = null;	
				self.internal.tempAddress = new Address();
				jQuery('input[ng-value="order.budget.order_client.person_code"]').val('');
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

			if (code == self.budget.order_seller.person_code || !parseInt(code))
				return;

			$rootScope.loading.load();
			getPersonByCode(code, Globals.get('personCategories').seller).then(function(success) {
				self.budget.setSeller(new Person(success.data));
				self.internal.tempSeller = new Person(success.data);
				$timeout(function() {
					self.scrollTo('section[name="products"]');
					self.focusOn('input[name="autocompleteProduct"]');
				}, 500);
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();

				if (error.status == 404)
					self.showNotFound();
			});
		}

		/**
		 * Pesquisa vendedores pelo nome.
		 * @param {string} name - O nome do vendedor.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function getSellerByName(name) {
			return getPersonByName(name, Globals.get('personCategories').seller);
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

			if (code == self.budget.order_client.person_code || !parseInt(code))
				return;

			var options = { getAddress: true, getContact: true };
			
			$rootScope.loading.load();
			getPersonByCode(code, Globals.get('personCategories').customer, options).then(function(success) {
				setCustomer(success.data);
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();

				if (error.status == 404)
					self.showNotFound();
			});
		}

		/**
		 * Pesquisa clientes pelo nome.
		 * @param {string} name - O nome do cliente.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function getCustomerByName(name) {
			return getPersonByName(name, Globals.get('personCategories').customer);
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

			var options = {
				getPrice: true,
				getStock: true,
				getUnit: true
			};

			$rootScope.loading.load();
			constants.debug && console.log('buscando produto por codigo', code);
			providerProduct.getByCode(code, self.budget.order_company_id, self.internal.tempItem.price_id, options).then(function(success) {
				self.internal.tempProduct = new Product(success.data);
				self.internal.tempItem.setProduct(new Product(success.data));
				self.focusOn('input[name="amount"]');
				$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();

				if (error.status == 404)
					self.showNotFound();
			});
		}

		/**
		 * Pesquisa produtos pelo nome.
		 * @param {string} name - O nome do produto.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function getProductByName(name) {

			if (!name || name.length < 3)
				deferred.resolve([ ]);

			var deferred = $q.defer(),
				options  = {
					limit: 10,
					getPrice: true,
					getStock: true,
					getUnit: true
				};

			if (!isNaN(name) && angular.isNumber(+name)) {
				providerProduct.getByCode(name, self.budget.order_company_id, self.internal.tempItem.price_id, options).then(function(success) {
					deferred.resolve([ new Product(success.data) ]);
				}, function(error) {
					deferred.resolve([ ]);
				});
			} else {
				providerProduct.getByName(name, self.budget.order_company_id, self.internal.tempItem.price_id, options).then(function(success) {
					deferred.resolve(success.data.map(function(p) { return new Product(p); }));
				}, function(error) {
					constants.debug && console.log(error);
					deferred.resolve([ ]);
				});
			}

			return deferred.promise;
		}

		/**
		 * Adiciona a tabela de precos em um item.
		 * @param {string} priceId - O id da tabela.
		 */
		function priceTableChanged(priceId) {
			clearProductSearch();
			self.internal.tempItem.price_id = priceId;
		}

		/**
		 * Aplica uma aliquota de desconto no item atual.
		 * @param {float} value - O valor do desconto.
		 */
		function setItemAlDiscount(value) {
			var max = parseFloat(Globals.get('user-max-discount') || 0);

			if (value > max) {
				value = max;
			}

			self.internal.tempItem.setAlDiscount(value);
			self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
			self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
		}

		/**
		 * Aplica um valor de desconto no item atual.
		 * @param {float} value - O valor do desconto.
		 */
		function setItemVlDiscount(value) {
			var maxAl = parseFloat(Globals.get('user-max-discount') || 0),
				currentAl = (parseFloat(value) * 100) / self.internal.tempItem.getValue();

			if (currentAl > maxAl) {
				currentAl = maxAl;
			}

			// self.internal.tempItem.setVlDiscount(value);
			// self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
			setItemAlDiscount(currentAl);
		}

		/**
		 * Aplica uma aliquota de desconto igual para todos os items.
		 * @param {float} value - O valor do desconto.
		 */
		function setTotalAlDiscount(value) {
			if (!value) return;
		}

		/**
		 * Aplica um valor de desconto igual para todos os items.
		 * @param {float} value - O valor do desconto.
		 */
		function setTotalVlDiscount(value) {
			if (!value) return;

			value =  Math.max(parseFloat(value), 0);

			if (value > parseFloat(Globals.get('user-max-discount'))) {

			} else {

			}
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

		/**
		 * Exibe um modal com aviso de 404 not found.
		 */
		function showNotFound() {
			$rootScope.customDialog().showMessage('Aviso', 'Nenhum resultado encontrado!');
		}

		/**
		 * Exibe um modal com os contatos do endereco.
		 * @param (object) - um array com os contatos.
		 */
		function showAddressContact(array) {
			var html = '';
			
			if (array.length) {
				angular.forEach(array, function(item) {
					html += '<b>' + item.person_address_contact_label + ': </b>';
					html += item.person_address_contact_value;
					html += '<br>';
				});
			} else {
				html += 'Nenhum contato cadastrado.'
			}

			$rootScope.customDialog().showMessage('Contatos', html);
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
					var index = self.budget.order_items.indexOf(item);
					self.budget.order_items[index] = new OrderItem(res);
				}, function(error) { });
		}

		function addItem() {
			if (self.internal.tempItem.product && self.internal.tempItem.product.product_id) {
				if (self.internal.tempItem.order_item_amount > 0) {
					self.budget.order_items.push(new OrderItem(self.internal.tempItem));
					var container = jQuery('.container-table');
					container.animate({ scrollTop: container.height() });
				}
				self.internal.tempProduct = null;
				self.internal.tempItem = new OrderItem({ price_id: getMainUserPriceId().price_id, user_price: getMainUserPriceId() });
			}

			self.focusOn('input[name="autocompleteProduct"]');
		}

		function removeItem(item) {
			if (!item)
				return;

			var message = 'Deseja remover o item? <br><br><b>';
			message += item.product.product_code + ' - ';
			message += item.product.product_name + '</b>';

			$rootScope.customDialog().showConfirm('Aviso', message)
				.then(function(success) {
					constants.debug && console.log('resolved');
					var index = self.budget.order_items.indexOf(item);
					self.budget.order_items.splice(index, 1);
				}, function(error) { 
					constants.debug && console.log('rejected');
				});
		}
	}
}());