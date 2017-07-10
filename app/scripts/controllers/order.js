/*
* @Author: egmfilho
* @Date:   2017-05-25 17:59:28
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-10 17:45:36
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
		'$route', 
		'$routeParams', 
		'$q', 
		'$mdPanel', 
		'Cookies',
		'Constants',
		'Globals',
		'ProviderOrder',
		'Order', 
		'ProviderPerson', 
		'Person',
		'Address', 
		'ProviderProduct', 
		'Product', 
		'OrderItem',
		'UserCompany',
		'ProviderTerm',
		'Term',
		'ProviderModality',
		'PaymentModality',
		'OrderPayment',
		'ElectronWindow' 
	];

	function OrderCtrl(
		$rootScope, 
		$scope, 
		$timeout, 
		$location, 
		$route, 
		$routeParams, 
		$q, 
		$mdPanel,
		Cookies, 
		constants, 
		Globals, 
		providerOrder, 
		Order, 
		providerPerson, 
		Person, 
		Address, 
		providerProduct, 
		Product, 
		OrderItem, 
		UserCompany, 
		providerTerm,
		Term,
		providerModality,
		PaymentModality,
		OrderPayment,
		ElectronWindow) {

		var self = this;

		$scope.debug = constants.debug;
		$scope.globals = Globals.get;

		if (constants.isElectron) {
			var Mousetrap = require('mousetrap');

			Mousetrap.bind(['command+n', 'ctrl+n'], function() {
				$scope.newOrder();
				return false;
			});

			Mousetrap.bind(['command+a', 'ctrl+a'], function() {
				$scope.open();
				return false;
			});

			Mousetrap.bind(['command+s', 'ctrl+s'], function() {
				$scope.save();
				return false;
			});

			Mousetrap.bind(['command+p', 'ctrl+p'], function() {
				self.print();
				return false;
			});

			Mousetrap.bind(['command+e', 'ctrl+e'], function() {
				self.selectCompany();
				return false;
			});
		}

		function newOrder() {
			$location.path() == '/order/new' ? $route.reload() : $location.path('/order/new');
		}

		self.canSave            = canSave;
		self.canExport          = canExport;
		self.canPrint           = canPrint;
		self.canChangeCompany   = canChangeCompany;
		self.selectCompany      = selectCompany;
		self.internal           = internalItems();
		self.budget             = new Order({ order_user: Globals.get('user')});
		self.newCustomer        = newCustomer;
		self.setCustomer        = setCustomer;
		self.clearSeller        = clearSeller;
		self.clearProductSearch = clearProductSearch;
		self.clearItems         = clearItems;
		self.clearCustomer      = clearCustomer;
		self.clearNote          = clearNote;
		self.clearPayments      = clearPayments;
		self.clearTerm          = clearTerm;
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
		self.authorizeDiscount  = authorizeDiscount;
		self.scrollTo           = scrollTo;
		self.focusOn            = focusOn;
		self.print              = print;
		self.savePDF            = savePDF;
		self.showNotFound       = showNotFound;
		self.showAddressContact = showAddressContact;
		self.exportOrder        = exportOrder;
		self.exportDAV          = exportDAV;
		self.searchTerm         = searchTerm;
		self.getTermByCode      = getTermByCode;
		self.addModality        = addModality;
		self.addPayment         = addPayment;
		self.editPayment        = editPayment;
		self.removePayment      = removePayment;
		self.paymentDialog      = paymentDialog;
		self.recalcPayments     = recalcPayments;

		self.editItemMenu       = editItemMenu;
		self.showEditItemModal  = showEditItemModal;
		self.addItem            = addItem;
		self.removeItem         = removeItem;

		$scope.$on('$destroy', function() {
			$location.search('code', null);
			$location.search('company', null);
		});

		$scope.$on('$viewContentLoaded', function() {
			self.searchTerm();

			if ($routeParams.action && $routeParams.action == 'edit' && $routeParams.code) {
				var options = {
					getCompany: true,
					getUser: true,
					getCustomer: true,
					getSeller: true,
					getItems: true,
					getPayments: true,
					getTerm: true
				};
				$rootScope.loading.load();
				providerOrder.getByCode($routeParams.code, options).then(function(success) {
					self.budget = new Order(success.data);
					
					/* copia os valores para as variaveis temporarias dos autocompletes */
					self.internal.tempSeller = new Person(self.budget.order_seller);					
					self.internal.tempCustomer = new Person(self.budget.order_client);

					/* manda o cliente para o controller do cadastro de endereco */
					$scope.$broadcast('customerAdded', self.budget.order_client);

					/* copia o endereco de entrega para o corpo do orcamento */
					self.budget.address_delivery = new Address(self.budget.order_client.person_address.find(function(a) {
						return a.person_address_code == self.budget.order_address_delivery_code;
					}));

					constants.debug && console.log('orcamento carregado', self.budget);
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.customDialog().showMessage('Erro', 'Não foi possível abrir o orçamento, tente novamente mais tarde.')
						.then(function(success) {
							$location.path('/order/new');
						}, function(error) {
							$location.path('/order/new');
						});
					$rootScope.loading.unload();
				});
			} else if ($routeParams.action && $routeParams.action == 'new') {
				if (!self.budget.order_company_id) {
					/* Seleciona a empresa principal */
					var company = Globals.get('user-companies-raw').find(function(company) {
						return company.user_company_main == 'Y';
					});
					self.budget.setCompany(new UserCompany(company).company_erp);
				}
			} else {
				$location.path('/');
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
			if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
				newOrder();
			} else {
				$rootScope.customDialog().showConfirm('Aviso', 'Deseja descartar o orçamento atual?')
					.then(function(success) {
						newOrder();
					}, function(error) { });
			}
		};

		$scope.open = function() {
			$location.path('/open-order');
		};

		$scope.save = function() {
			if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
				$rootScope.customDialog().showMessage('Erro!', 'Este orçamento já foi exportado e não pode mais ser editado!');
				return;
			}

			if (!self.budget.order_company_id || !self.budget.order_client_id || !self.budget.order_seller_id || !self.budget.order_items.length || !self.budget.order_address_delivery_code) {
				$rootScope.customDialog().showMessage('Erro!', 'Preencha todos os campos corretamente!');
				return;
			}

			if (self.budget.getChange() != 0 && self.budget.order_payments.length) {
				$rootScope.customDialog().showMessage('Erro!', 'Reveja os valores dos pagamentos!');
				return;	
			}

			var today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
			for (var i = 0; i < self.budget.order_payments.length; i++) {
				if (moment(self.budget.order_payments[i].order_payment_deadline).isBefore(today)) {
					$rootScope.customDialog().showMessage('Erro', 'Não é possível salvar o orçamento pois o mesmo contém ao menos uma forma de pagamento com data anterior à data de hoje.');
					return;
				}
			}

			$rootScope.customDialog().showConfirm('Aviso', 'Deseja salvar o orçamento atual?')
				.then(function(success) {
					var filtered = angular.merge({ }, self.budget, {
						order_address: null,
						order_client: null,
						order_company: null,
						order_mail_sent: null,
						order_seller: null
					});

					constants.debug && console.log('salvando orçamento: ', filtered);

					$rootScope.loading.load();
					if (self.budget.order_code && self.budget.order_id) {
						/* Edita o orcamento */
						providerOrder.edit(filtered).then(function(success) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Sucesso', 'Orçamento editado!');
						}, function(error) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					} else {
						/* Salva o orcamento */
						providerOrder.save(filtered).then(function(success) {
							constants.debug && console.log('orcamento salvo', success);
							self.budget.order_id = success.data.order_id;
							self.budget.order_code = success.data.order_code;
							$rootScope.loading.unload();

							var controller = function() {
								this._showCloseButton = true;
								this.order_code = success.data.order_code;
							};

							$rootScope.customDialog().showTemplate('Sucesso', './partials/modalOrderSaved.html', controller)
								.then(function(res) {
									switch (res) {
										case 'print': {
											print();
											newOrder();
											break;
										}
										
										case 'mail': {
											alert('ainda nao implementado');
											break;
										}
										
										case 'order': {
											exportOrder(success.data.order_id).then(function(success) {
												//$rootScope.toast('Orçamento exportado!', 'Código gerado: '+success.data.order_code);
												newOrder();
											}, function(error) {
												$rootScope.customDialog().showMessage('Erro', error.data.status.description);
												newOrder();
											});
											break;
										}
										
										case 'dav': {
											exportDAV(success.data.order_id).then(function(success) {
												//$rootScope.toast('Orçamento exportado!', 'Código gerado: '+success.data.order_code);
												newOrder();
											}, function(error) {
												$rootScope.customDialog().showMessage('Erro', error.data.status.description);
												newOrder();
											});
											break;
										}
									}
								}, function(res) {

								});
						}, function(error) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					}
				}, function(error) { });
		};

		$scope.$watch(function() {
			return self.internal.term.queryTerm;
		}, function(newValue, oldValue) {
			if (newValue)
				searchTerm();
		});

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
				},
				term: {
					tempTerm: new Term(),
					queryTerm: null,
					queryResult: new Array(),
					updateSearch: function(e) {
						e.stopPropagation();
					},
					clear: function() {
						self.internal.term.tempTerm = new Term();
						self.internal.term.queryTerm = null;
						self.searchTerm();
					}
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
		 * Verifica se o orcamento pode ser salvo.
		 */
		function canSave() {
			return self.budget.order_company_id && self.budget.order_status_id == Globals.get('order-status-values').open;
		}

		/**
		 * Verifica se o orcamento pode ser exportado.
		 */
		function canExport() {
			return self.budget.order_code && self.budget.order_status_id == Globals.get('order-status-values').open;
		}

		/**
		 * Verifica se o orcamento pode ser impresso.
		 */
		function canPrint() {
			return !!self.budget.order_code;
		}

		/**
		 * Verifica se o orcamento pode ter a empresa trocada.
		 */
		function canChangeCompany() {
			return self.budget.order_status_id == Globals.get('order-status-values').open;
		}

		/**
		 * Abre uma janela para informar a loja quando 
		 * o usuario possui mais de uma loja vinculada.
		 */
		function selectCompany() {
			if (!self.canChangeCompany()) return;

			var dialog = $rootScope.customDialog(),
				controller = function() { },
				options,
				_companies = Globals.get('user-companies-raw').map(function(c) {
					return new UserCompany(c);
				});

			controller.prototype = {
				_showCloseButton: true,
				companies: _companies,
				company: _companies[0]
			};

			// options = { 
			// 	hasBackdrop: true,
			// 	clickOutsideToClose: false,
			// 	zIndex: 1
			// };

			dialog.showTemplate('Informe a empresa', './partials/modalSelectCompany.html', controller, options)
				.then(function(res) {
					self.budget.setCompany(res.company_erp);
					constants.debug && console.log('company: ', self.budget.order_company.company_name);
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
					providerPerson.save(res, Globals.get('person-categories').customer).then(function(success) {
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
			self.internal.tempItemAlDiscount = 0;
			self.internal.tempItemVlDiscount = 0;
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
				self.budget.removeDeliveryAddress();
				self.internal.tempCustomer = null;	
				self.internal.tempAddress = new Address();
				jQuery('input[ng-value="order.budget.order_client.person_code"]').val('');
			}, function() { });
		}

		/**
		 * Limpa o campo de observacoes.
		 */
		function clearNote() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja limpar os campos?').then(function() {
				self.budget.order_note = null;
				self.budget.order_note_doc = null;
			}, function() { });
		}

		/**
		 * Limpa o campo de pagamento.
		 */
		function clearPayments() {
			$rootScope.customDialog().showConfirm('Aviso', 'Deseja remover todos os pagamentos?').then(function() {
				self.budget.term_id = null;
				self.budget.order_payments = new Array();
				self.clearTerm();
			}, function() { });
		}

		/**
		 * Limpa a pesquisa de prazo do campo de pagamento.
		 */
		function clearTerm() {
			self.internal.term.clear();	
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
			getPersonByCode(code, Globals.get('person-categories').seller).then(function(success) {
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
			return getPersonByName(name, Globals.get('person-categories').seller);
		}

		/**
		 * Pesquisa o cliente pelo codigo.
		 * @param {string} code - O codio do cliente.
		 */
		function getCustomerByCode(code) {
			if (!code) {								
				var defaultCustomer = Globals.get('default-customer'),
					message = '';

				if (defaultCustomer) {
					message = 'Aplicar perfil: <b>' + defaultCustomer.code + ' - ' + defaultCustomer.name + '</b>';
				} else {
					self.focusOn('input[name="autocompleteCustomer"]');
					return;
				}

				$rootScope.customDialog().showConfirm('Confirmação', message)
					.then(function(success) {
						constants.debug && console.log('Aplicando cliente padrao: ' + defaultCustomer.code);
						self.getCustomerByCode(defaultCustomer.code);
					}, function(error) {
						self.focusOn('input[name="autocompleteCustomer"]');
					});

				return;
			}

			if (code == self.budget.order_client.person_code || !parseInt(code))
				return;

			var options = { getAddress: true, getContact: true, getCredit: true };
			
			$rootScope.loading.load();
			getPersonByCode(code, Globals.get('person-categories').customer, options).then(function(success) {
				setCustomer(success.data);
				if (code == Globals.get('default-customer').code && self.budget.order_client.person_address.length)
					self.budget.setDeliveryAddress(self.budget.order_client.person_address[0])
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
			return getPersonByName(name, Globals.get('person-categories').customer);
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
			value = parseFloat(value);

			if (self.internal.tempItemAlDiscount == self.internal.tempItem.order_item_al_discount && 
				self.internal.tempItemVlDiscount == self.internal.tempItem.order_item_vl_discount)
				return;

			var max = parseFloat(Globals.get('user-max-discount') || 0),
				setAl = function(al) {
					self.internal.tempItem.setAlDiscount(al);
					self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
					self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
				};

			if (value > max) {
				authorizeDiscount(value).then(function(success) {
					if (value > success.user_max_discount) {
						$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
						setAl(self.internal.tempItem.order_item_al_discount);
					} else {
						self.internal.tempItem.setAudit({
							user_id: success.user_id,
							user_name: success.user_name,
							product_code: self.internal.tempItem.product.product_code,
							product_name: self.internal.tempItem.product.product_name,
						});
						setAl(value);
					}
				}, function(error) {
					setAl(self.internal.tempItem.order_item_al_discount);
				});
			} else {
				setAl(value);
			}
		}

		/**
		 * Aplica um valor de desconto no item atual.
		 * @param {float} value - O valor do desconto.
		 */
		function setItemVlDiscount(value) {
			var currentAl = self.internal.tempItem.getValue() == 0 ? 0 : (parseFloat(value) * 100) / self.internal.tempItem.getValue(),
				maxAl = parseFloat(Globals.get('user-max-discount') || 0),
				setVl = function(vl) {
					self.internal.tempItem.setVlDiscount(vl);
					self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
					self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
				};

			if (self.internal.tempItemAlDiscount == self.internal.tempItem.order_item_al_discount && 
				self.internal.tempItemVlDiscount == self.internal.tempItem.order_item_vl_discount)
				return;

			if (currentAl > maxAl) {
				authorizeDiscount(currentAl).then(function(success) {
					if (currentAl > success.user_max_discount) {
						$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
						setVl(self.internal.tempItem.order_item_vl_discount);
					} else {
						self.internal.tempItem.setAudit({
							user_id: success.user_id,
							user_name: success.user_name,
							product_code: self.internal.tempItem.product.product_code,
							product_name: self.internal.tempItem.product.product_name,
						});
						setVl(value);
					}
				}, function(error) {
					setVl(self.internal.tempItem.order_item_vl_discount);
				});
			} else {
				setVl(value);
			}
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
		 * Abre um modal para autorizar o desconto do item.
		 * @param {float} value - O valor do desconto.
		 * @param {float} max - O valor maximo de desconto permitido para o usuario.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function authorizeDiscount(value) {
			var deferred = $q.defer(),
				options = null;

			function controller($rootScope, providerPermission, Audit) {
				var ctrl = this;

				this.text = 'Desconto acima do permitido: ' + value.toFixed(2) + '%';
				this.user = null;
				this.pass = null;
				this.authorize = authorize;

				function authorize(user, pass, callback) {
					$rootScope.loading.load();
					providerPermission.authorize('order', 'user_discount', user, pass).then(function(success) {
						$rootScope.loading.unload();
						ctrl._close(success.data);
					}, function(error) {
						$rootScope.loading.unload();
						$rootScope.customDialog().showMessage('Aviso', error.data.status.description);
					});
				}
			}

			controller.$inject = [ '$rootScope', 'ProviderPermission', 'Audit' ];

			options = {
				hasBackdrop: true,
				clickOutsideToClose: false,
				escapeToClose: false,
				zIndex: 1
			};
			
			$rootScope.customDialog().showTemplate('Autorização requerida', './partials/modalAuthorization.html', controller, options)
				.then(function(success) {
					deferred.resolve(success);
				}, function(error) {
					deferred.reject();
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
				jQuery(selector).focus().select();
			}, 100);
		}

		/**
		 * Instancia uma nova janela e chama o dialogo para salvar o PDF.
		 */
		function savePDF() {
			if (!self.canPrint) return;

			if (constants.isElectron)
				ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + self.budget.order_code + '?action=pdf');
			else
				$location.path('/order/print/'+self.budget.order_code)
		}

		/**
		 * Instancia uma nova janela e chama o dialogo de impressao.
		 */
		function print() {
			if (!self.canPrint) return;

			if (constants.isElectron)
				ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + self.budget.order_code + '?action=print');
			else
				$location.path('/order/print/'+self.budget.order_code)
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

		/**
		 * Exporta o orcamento para pedido.
		 * @param (id) - O id do orcamento.
		 */
		function exportOrder(id) {
			if (!self.canPrint) return;

			if (self.budget.order_id == null) {
				$rootScope.customDialog().showMessage('Erro!', 'Este orçamento ainda não foi salvo!');
				return;
			}
			
			if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
				$rootScope.customDialog().showMessage('Erro!', 'Este orçamento já foi exportado!');
				return;
			}

			var deferred = $q.defer();

			$rootScope.customDialog().showConfirm('Aviso', 'Exportar pedido?')
				.then(function(success) {
					constants.debug && console.log('exportando pedido: ' + id);
					$rootScope.loading.load();
					providerOrder.exportOrder(id).then(function(success) {
						$rootScope.loading.unload();
						deferred.resolve(success);
					}, function(error) {
						constants.debug && console.log(error);
						$rootScope.loading.unload();
						deferred.reject(error);
					});
				}, function(error) { });

			return deferred.promise;
		}

		/**
		 * Exporta o orcamento para DAV.
		 * @param (id) - O id do orcamento.
		 */
		function exportDAV(id) {
			if (!self.canPrint) return;

			if (self.budget.order_id == null) {
				$rootScope.customDialog().showMessage('Erro!', 'Este orçamento ainda não foi salvo!');
				return;
			}

			if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
				$rootScope.customDialog().showMessage('Erro!', 'Este orçamento já foi exportado!');
				return;
			}

			var deferred = $q.defer();

			$rootScope.customDialog().showConfirm('Aviso', 'Exportar DAV?')
				.then(function(success) {
					constants.debug && console.log('exportando DAV: ' + id);
					$rootScope.loading.load();
					providerOrder.exportDAV(id).then(function(success) {
						$rootScope.loading.unload(success);
						deferred.resolve(success);
					}, function(error) {
						constants.debug && console.log(error);
						$rootScope.loading.unload();
						deferred.reject(error);
					});
				}, function(error) { });

			return deferred.promise;
		}

		/**
		 * Atualiza o resultado da pesquisa de prazo.
		 */
		function searchTerm() {
			var options = {
				limit: 10
			};

			providerTerm.getByDescription(self.internal.term.queryTerm).then(function(success) {
				self.internal.term.queryResult = success.data.map(function(t) { return new Term(t) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}		

		/**
		 * Atualiza o resultado da pesquisa de prazo.
		 */
		function getTermByCode(code) {
			var options = {
				getModality: true
			};

			$rootScope.loading.load();
			providerTerm.getByCode(code, options).then(function(success) {
			self.internal.term.tempTerm = new Term(success.data);
			$rootScope.loading.unload();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		/**
		 * Adiciona uma forma a partir do resultado da busca de prazo.
		 */
		function addModality(modality) {
			var term = self.internal.term.tempTerm,
				message = '';

			function add() {
				var i,
					dateCalc,
					payments = [ ];

				/* Calcula os vencimentos das parcelas */
				dateCalc = function(installment, delay, interval) {
					var date = new Date(),
						today = new Date(),
						installment_delay = installment * interval;

					date.setDate(today.getDate() + delay + installment_delay);

					return date;
				}

				/* Trata primeiro para quando for cartao de credito */
				if (modality.modality_type == Globals.get('modality-types')['credit-card']) {
					payments.push(new OrderPayment({
							order_id: self.budget.order_id,
							order_payment_value: self.budget.getChange(),
							order_payment_value_total: self.budget.getChange(),
							order_payment_deadline: dateCalc(0, term.term_delay, 0),
							order_payment_installment: term.term_installment,
							modality_id: modality.modality_id,
							modality: new PaymentModality(modality)
						}));
				} else {
					var total = 0;
					for (i = 0; i < term.term_installment; i++) {
						payments.push(new OrderPayment({
							order_id: self.budget.order_id,
							order_payment_value: parseFloat((self.budget.getChange() / term.term_installment).toFixed(2)),
							order_payment_value_total: parseFloat((self.budget.getChange() / term.term_installment).toFixed(2)),
							order_payment_deadline: dateCalc(i, term.term_delay, term.term_interval),
							order_payment_installment: 1,
							order_payment_initial: i == 0 ? 'Y' : 'N',
							modality_id: modality.modality_id,
							modality: new PaymentModality(modality)
						}));

						total += payments[i].order_payment_value;
					}
					payments[payments.length - 1].order_payment_value += self.budget.order_value_total - total;
					payments[payments.length - 1].order_payment_value_total += self.budget.order_value_total - total;
				}

				self.budget.order_payments = self.budget.order_payments.concat(payments);
				self.budget.term_id = term.term_id;
			}


			if (self.budget.order_payments.length) {
				message = 'Ao adicionar um prazo, todos os pagamentos já informados serão removidos. ';
				message += 'Deseja Continuar?';
				$rootScope.customDialog().showConfirm('Aviso', message).then(function(success) {
					self.budget.order_payments = new Array();
					add();
				}, function(error){ });
			} else {
				add();
			}
		}

		/**
		 * Abre um modal de pesquisa de modalidades que retorna 
		 * um pagamento para ser adicionado ao orcamento.
		 */
		function addPayment() {
			if (self.budget.term_id) {
				$rootScope.customDialog().showConfirm('Aviso', 'Para adicionar um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
					.then(function(success) {
						self.budget.term_id = null;
						self.addPayment();
					}, function(error) { });
				return;
			}

			self.paymentDialog('Adicionar pagamento').then(function(success) {
				var payment = new OrderPayment(success);

				/* Se for selecionado como parcela inicial verifica se existe algum pagamento com data inferior. */
				if (payment.order_payment_initial == 'Y') {
					var i, flag;

					for (i = 0; i < self.budget.order_payments.length; i++) {
						if (self.budget.order_payments[i].order_payment_deadline.getTime() < payment.order_payment_deadline.getTime()) {
							flag = true;
							break;
						}
					}

					if (flag) {
						$rootScope.customDialog().showMessage('Aviso', 'Não foi possível colocar o pagamento como parcela inicial pois já existe um pagamento com uma data inferior.');
						payment.order_payment_initial = 'N';
					} else {
						/* Desmarca o atual incial. */
						angular.forEach(self.budget.order_payments, function(item) { item.order_payment_initial = 'N' });
					}
				}

				self.budget.order_payments.push(payment);
			}, function(error) { });
		}

		/**
		 * Edita o pagamento informado.
		 * @param (id) - O pagamento a ser editado.
		 */
		function editPayment(payment) {
			if (self.budget.term_id) {
				$rootScope.customDialog().showConfirm('Aviso', 'Para editar um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
					.then(function(success) {
						self.budget.term_id = null;
						self.editPayment(payment);
					}, function(error) { });
				return;
			}

			var temp = new OrderPayment(payment),
				options = {
					companyId: self.budget.order_company_id,
					getInstallments: true
				};

			$rootScope.loading.load();
			/* primeiro pega todos os prazos vinculados a modalidade */
			providerModality.getById(payment.modality_id, options).then(function(success) {
				$rootScope.loading.unload();
				/* coloca no pagamento e manda pro modal */
				temp.modality = new PaymentModality(success.data);
				self.paymentDialog('Editar pagamento', temp).then(function(success) {
					var index = self.budget.order_payments.indexOf(payment),
						payment = new OrderPayment(success);

					/* Copiado do addPayment(). */
					if (payment.order_payment_initial == 'Y') {
						var i, flag;

						for (i = 0; i < self.budget.order_payments.length; i++) {
							if (self.budget.order_payments[i].order_payment_deadline.getTime() < payment.order_payment_deadline.getTime()) {
								flag = true;
								break;
							}
						}

						if (flag) {
							$rootScope.customDialog().showMessage('Aviso', 'Não foi possível colocar o pagamento como parcela inicial pois já existe um pagamento com uma data inferior.');
							payment.order_payment_initial = 'N';
						} else {
							/* Desmarca o atual incial. */
							angular.forEach(self.budget.order_payments, function(item) { item.order_payment_initial = 'N' });
						}
					}

					self.budget.order_payments[index] = payment;
				}, function(error) { });
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		/**
		 * Remove o pagamento informado.
		 * @param (id) - O pagamento a ser removido.
		 */
		function removePayment(payment) {
			if (self.budget.term_id) {
				$rootScope.customDialog().showConfirm('Aviso', 'Para remover um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
					.then(function(success) {
						self.budget.term_id = null;
						self.removePayment(payment);
					}, function(error) { });
				return;
			}

			var msg = 'Deseja remover o pagamento: <b>[';
			msg += payment.order_payment_installment + 'x] ';
			msg += payment.modality.modality_description + '</b>';

			$rootScope.customDialog().showConfirm('Aviso', msg).then(function(success) {
				var index = self.budget.order_payments.indexOf(payment);
				self.budget.order_payments.splice(index, 1);
			}, function(error) { });
		}

		/**
		 * Abre uma janela para a insercao ou edicao de uma forma de pagamento.
		 * @param (id) - O titulo do modal.
		 * @param (object) - O pagamento a ser editado.
		 * @returns (object) - Uma promise com o resultado.
		 */
		function paymentDialog(title, payment) {
			var deferred = $q.defer(),
				controller = function($s) {
					var scope = this;

					$s.$watch(function() {
						return scope.queryModality;
					}, function(newValue, oldValue) {
						if (newValue)
							scope.searchModality();
					});

					this.searchModality();
				};

			controller.$inject = [ '$scope' ];

			controller.prototype = {
				_showCloseButton: true,
				
				minDate: new Date(),
				
				modality: payment ? new PaymentModality(payment.modality) : null,
				
				payment: payment ? new OrderPayment(payment) : new OrderPayment({
					order_payment_value: self.budget.getChange(),
					order_payment_value_total: self.budget.getChange()
				}),
				
				queryModality: payment ? payment.modality.modality_description : null,
				
				queryResult: null,
				
				searchModality: function() {
					var scope = this;
					providerModality.getByDescription(this.queryModality).then(function(success) {
						scope.queryResult = success.data.map(function(m) { return new PaymentModality(m) });
					}, function(error) {
						constants.debug && console.log(error);
					});
				},
				
				updateSearch: function(e) {
					e.stopPropagation();
				},

				getModalityById: function(id) {
					var scope = this,
						options = {
							companyId: self.budget.order_company_id,
							getInstallments: true
						};

					$rootScope.loading.load();
					providerModality.getById(id, options).then(function(success) {
						scope.payment.setModality(new PaymentModality(success.data));
						scope.setDeadline(scope.payment.modality.modality_item[0].modality_item_delay);
						$rootScope.loading.unload();
					}, function(error) {
						constants.debug && console.log(error);
						$rootScope.loading.unload();
					});
				},

				setDeadline: function(delay) {
					var date = new Date();
					date.setDate(this.minDate.getDate() + delay);
					this.payment.order_payment_deadline = date;
				}
			}

			$rootScope.customDialog().showTemplate(title, './partials/modalPayment.html', controller)
				.then(function(success) {
					deferred.resolve(success);
				}, function(error) {
					deferred.reject(error);
				});

			return deferred.promise;
		}

		/**
		 * Recalcula o valor dos pagamentos/parcelas.
		 */
		function recalcPayments() {
			var slice = self.budget.order_value_total / self.budget.order_payments.length,
				total = 0;

			angular.forEach(self.budget.order_payments, function(item, index) {
				item.order_payment_value = parseFloat(slice.toFixed(2));
				item.order_payment_value_total = parseFloat(slice.toFixed(2));
				item.order_payment_al_discount = 0;
				item.order_payment_vl_discount = 0;
				total += item.order_payment_value;
			});
			console.log(total);

			self.budget.order_payments[self.budget.order_payments.length - 1].order_payment_value += self.budget.order_value_total - total;
		}




		function editItemMenu($mdMenu, event) {
			$mdMenu.open(event);
		}

		function showEditItemModal(item) {
			var dialog = $rootScope.customDialog(),
				controller;

			controller = function() {
				var scope = this;

				this._showCloseButton = true;
				this.focusOn = focusOn;
				this.item = new OrderItem(item);
				this.tempAl = item.order_item_al_discount;
				this.tempVl = item.order_item_vl_discount;

				this.setItemAlDiscount = function(value) {
					value = parseFloat(value);

					var max = parseFloat(Globals.get('user-max-discount') || 0),
						setAl = function(al) {
							scope.item.setAlDiscount(al);
							scope.tempAl = scope.item.order_item_al_discount;
							scope.tempVl = scope.item.order_item_vl_discount;
						};

					if (scope.tempAl == scope.item.order_item_al_discount && scope.tempVl == scope.item.order_item_vl_discount)
						return;

					if (value > max) {
						authorizeDiscount(value).then(function(success) {
							if (value > success.user_max_discount) {
								$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
								setAl(scope.item.order_item_al_discount);
							} else {
								scope.item.setAudit({
									user_id: success.user_id,
									user_name: success.user_name,
									product_code: scope.item.product.product_code,
									product_name: scope.item.product.product_name
								});
								setAl(value);
							}
						}, function(error) {
							setAl(scope.item.order_item_al_discount);
						});
					} else {
						setAl(value);
					}
				}

				this.setItemVlDiscount = function(value) {
					var currentAl = scope.item.getValue() == 0 ? 0 : (parseFloat(value) * 100) / scope.item.getValue(),
						maxAl = parseFloat(Globals.get('user-max-discount') || 0),
						setVl = function(vl) {
							scope.item.setVlDiscount(vl);
							scope.tempAl = scope.item.order_item_al_discount;
							scope.tempVl = scope.item.order_item_vl_discount;
						};

					if (scope.tempAl == scope.item.order_item_al_discount && scope.tempVl == scope.item.order_item_vl_discount)
						return;

					if (currentAl > maxAl) {
						authorizeDiscount(currentAl).then(function(success) {
							if (currentAl > success.user_max_discount) {
								$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
								setVl(scope.item.order_item_vl_discount);
							} else {
								scope.item.setAudit({
									user_id: success.user_id,
									user_name: success.user_name,
									product_code: scope.item.product.product_code,
									product_name: scope.item.product.product_name,
								});
								setVl(value);
							}
						}, function(error) {
							setVl(scope.item.order_item_vl_discount);
						});
					} else {
						setVl(value);
					}
				};
			}

			dialog.showTemplate('Editar', './partials/modalEditItem.html', controller, { zIndex: 1 })
				.then(function(res) {
					var index = self.budget.order_items.indexOf(item);
					self.budget.replaceItem(index, res);
				}, function(error) { });
		}

		function addItem() {
			self.focusOn('input[name="autocompleteProduct"]');

			$timeout(function() {
				if (self.internal.tempItem.product && self.internal.tempItem.product.product_id) {
					if (self.internal.tempItem.order_item_amount > 0) {
						self.budget.addItem(new OrderItem(self.internal.tempItem));
						var container = jQuery('.container-table');
						container.animate({ scrollTop: container.height() });
					}

					self.internal.tempProduct = null;
					self.internal.tempItemAlDiscount = 0;
					self.internal.tempItemVlDiscount = 0;
					self.internal.tempItem = new OrderItem({ price_id: getMainUserPriceId().price_id, user_price: getMainUserPriceId() });
				}
			}, 100);
		}

		function removeItem(item) {
			if (!item)
				return;

			var message = 'Deseja remover o item? <br><br><b>';
			message += item.product.product_code + ' - ';
			message += item.product.product_name + '</b>';

			$rootScope.customDialog().showConfirm('Aviso', message)
				.then(function(success) {
					self.budget.removeItem(item);
				}, function(error) { });
		}
	}
}());