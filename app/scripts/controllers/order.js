/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-25 17:59:28
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-23 18:10:12
*/

(function() {
	'use strict';
	
	angular.module('commercial2.controllers')
		.controller('OrderCtrl', OrderCtrl);

	OrderCtrl.$inject = [ 
		'$rootScope', 
		'$scope', 
		'$compile',
		'$timeout',
		'$location',
		'$route', 
		'$routeParams', 
		'$q',
		'$filter', 
		'$mdPanel', 
		'Cookies',
		'Constants',
		'Globals',
		'ProviderOrder',
		'Order', 
		'ProviderPerson', 
		'Person',
		'ProviderPersonCredit',
		'PersonCredit',
		'ProviderAddress',
		'Address', 
		'ProviderProduct', 
		'Product', 
		'Price', 
		'OrderItem',
		'UserCompany',
		'ProviderTerm',
		'Term',
		'ProviderModality',
		'PaymentModality',
		'OrderPayment',
		'ProviderBank',
		'Bank',
		'ModalPerson',
		'ModalPersonCheck',
		'ModalNewPerson',
		'ModalProduct',
		'ModalCustomerAddress',
		'ElectronWindow',
		'ElectronOS',
		'GUID',
		'OpenedOrderManager'
	];

	function OrderCtrl(
		$rootScope, 
		$scope, 
		$compile,
		$timeout, 
		$location, 
		$route, 
		$routeParams, 
		$q, 
		$filter,
		$mdPanel,
		Cookies, 
		constants, 
		Globals, 
		providerOrder, 
		Order, 
		providerPerson, 
		Person, 
		providerCredit,
		PersonCredit, 
		providerAddress,
		Address, 
		providerProduct, 
		Product,
		Price, 
		OrderItem, 
		UserCompany, 
		providerTerm,
		Term,
		providerModality,
		PaymentModality,
		OrderPayment,
		providerBank,
		Bank,
		ModalPerson,
		ModalPersonCheck,
		ModalNewPerson,
		ModalProduct,
		ModalCustomerAddress,
		ElectronWindow,
		ElectronOS, 
		GUID,
		OpenedOrderManager) {

		var self = this, 
			_remote, 
			_ipcRenderer, 
			_backup, 
			_focusOn, 
			_preventClosing = true;

		$scope.debug = constants.debug;
		$scope.globals = Globals.get;
		$scope.isDisabled = true;
		$scope.$watch(function() {
			return $scope.isDisabled;
		}, function(newVal, oldVal) {
			self.internal.flags.isToolbarLocked = newVal;
		});

		self.propagateSaveOrder = function(company_id) {
			if (constants.isElectron && _ipcRenderer) {
				_ipcRenderer.send('propagate-save-order', company_id);
				console.log('propagating save order');
			}
			else {
				console.warn('could not propagate save order');
			}
		};

		/**
		 * Cria os atalhos globais de teclado.
		 */
		function bindKeys() {
			var Mousetrap = require('mousetrap');

			/* Avancar sessao */
			Mousetrap.bind('shift+enter', function(e, combo) {
				if (!self.internal.flags.isToolbarLocked) {
					switch(_focusOn) {
						case 'products': {
							self.scrollTo('section[name="customer"]');
							self.focusOn('input[name="customer-code"]');
							break;
						}

						case 'customer': {
							self.scrollTo('section[name="payment"]');
							self.focusOn('input[name="term-code"]');
							break;
						}

						case 'payment': {
							self.scrollTo('section[name="control"]');
							self.focusOn('button[name="save"]');
							break;
						}
					}
				}

				return false;
			});

			/* Novo orcamento */
			Mousetrap.bind(['command+n', 'ctrl+n'], function() {
				$scope.newOrder();
				return false;
			});

			/* Abrir orcamento */
			// Mousetrap.bind(['command+a', 'ctrl+a'], function() {
			// 	$scope.open();
			// 	return false;
			// });

			/* Salvar orcamento */
			Mousetrap.bind(['command+s', 'ctrl+s'], function() {
				if (!self.internal.flags.isToolbarLocked && self.canSave())
					$scope.save();

				return false;
			});

			/* Imprimir orcamento */
			Mousetrap.bind(['command+p', 'ctrl+p'], function() {
				if (!self.internal.flags.isToolbarLocked)
					self.print();

				return false;
			});

			/* Mudar empresa do orcamento */
			// Mousetrap.bind(['command+e', 'ctrl+e'], function() {
			// 	if (!self.internal.flags.isToolbarLocked)
			// 		self.selectCompany();

			// 	return false;
			// });

			/* Ir para produtos */
			Mousetrap.bind(['command+1', 'ctrl+1'], function() {
				if (!self.internal.flags.isToolbarLocked) {
					self.scrollTo('section[name="products"]');
					self.focusOn('input[name="product-code"]');
				}

				return false;
			});

			/* Ir para vendedor */
			// Mousetrap.bind(['command+2', 'ctrl+2'], function() {
			// 	if (!self.internal.flags.isToolbarLocked) {
			// 		self.scrollTo("section[name=\'seller\']");
			// 		self.focusOn('input[name="seller-code"]');
			// 	}

			// 	return false;
			// });

			/* Ir para cliente */
			Mousetrap.bind(['command+2', 'ctrl+2'], function() {
				if (!self.internal.flags.isToolbarLocked) {
					self.scrollTo("section[name=\'customer\']");
					self.focusOn('input[name="customer-code"]');
				}

				return false;
			});

			/* Ir para pagamento */
			Mousetrap.bind(['command+3', 'ctrl+3'], function() {
				if (!self.internal.flags.isToolbarLocked) {
					self.scrollTo("section[name=\'payment\']");
					self.focusOn('input[name="term-code"]');
				}

				return false;
			});
		}

		/**
		 * Limpa os atalhos globais de teclado.
		 */
		function unbindKeys() {
			var Mousetrap = require('mousetrap');

			Mousetrap.unbind('shift+enter');
			Mousetrap.unbind(['command+n', 'ctrl+n']);
			// Mousetrap.unbind(['command+a', 'ctrl+a']);
			Mousetrap.unbind(['command+s', 'ctrl+s']);
			Mousetrap.unbind(['command+p', 'ctrl+p']);
			Mousetrap.unbind(['command+e', 'ctrl+e']);
			Mousetrap.unbind(['command+1', 'ctrl+1']);
			Mousetrap.unbind(['command+2', 'ctrl+2']);
			Mousetrap.unbind(['command+3', 'ctrl+3']);
			// Mousetrap.unbind(['command+4', 'ctrl+4']);
		}

		/* Cria os atalhos do teclado */
		if (constants.isElectron) {
			var electron = require('electron');

			_remote = electron.remote;
			_ipcRenderer = electron.ipcRenderer;

			window.onbeforeunload = function(e) {
				if (_remote.getGlobal('isValidSession').value) {
					if (_preventClosing && self.canSave()) {
						e.returnValue = false;
						_remote.getCurrentWindow().focus();
					}
				}

				$scope.close();
			};
			bindKeys();
		}

		function newOrder() {
			$location.path() == '/order/new' ? $route.reload() : $location.path('/order/new');
		}

		// ******************************
		// Methods enumeration
		// ******************************

		self.isToolbarLocked       = isToolbarLocked;
		self.canSave               = canSave;
		self.canShowInfo           = canShowInfo;
		self.canExport             = canExport;
		self.canPrint              = canPrint;
		self.canChangeCompany      = canChangeCompany;
		self.isExported            = isExported;
		self.selectCompany         = selectCompany;
		self.internal              = internalItems();
		self.budget                = new Order({ order_user: Globals.get  ('user')});
		self.newCustomer           = newCustomer;
		self.setCustomer           = setCustomer;
		self.setOrderAudit         = setOrderAudit;
		self.clearSeller           = clearSeller;
		self.clearProductSearch    = clearProductSearch;
		self.clearItems            = clearItems;
		self.clearCustomer         = clearCustomer;
		self.clearNote             = clearNote;
		self.clearPayments         = clearPayments;
		self.clearTerm             = clearTerm;
		self.getPersonByCode       = getPersonByCode;
		self.getPersonByName       = getPersonByName;
		self.getCustomerByCode     = getCustomerByCode;
		self.getCustomerByName     = getCustomerByName;
		self.getProductByCode      = getProductByCode;
		self.getProductByName      = getProductByName;
		self.priceTableChanged     = priceTableChanged;
		self.setItemAmount         = setItemAmount;
		self.setItemAlDiscount     = setItemAlDiscount;
		self.setItemVlDiscount     = setItemVlDiscount;
		self.setTotalAlDiscount    = setTotalAlDiscount;
		self.setTotalVlDiscount    = setTotalVlDiscount;
		self.authorizationDialog   = authorizationDialog;
		self.authorizeDiscount     = authorizeDiscount;
		self.authorizeCredit       = authorizeCredit;
		self.editItem              = editItem;
		self.addItem               = addItem;
		self.removeItem            = removeItem;
		self.scrollTo              = scrollTo;
		self.focusOn               = focusOn;
		self.print                 = print;
		self.mail                  = mail;
		self.savePDF               = savePDF;
		self.showNotFound          = showNotFound;
		self.addressDialog         = addressDialog;
		self.showAddressContact    = showAddressContact;
		self.afterExportDialog     = afterExportDialog;
		self.exportOrder           = exportOrder;
		self.exportDAV             = exportDAV;
		self.searchTerm            = searchTerm;
		self.getTermByCode         = getTermByCode;
		self.selectTerm            = selectTerm;
		self.addModality           = addModality;
		self.addPayment            = addPayment;
		self.editPayment           = editPayment;
		self.removePayment         = removePayment;
		self.removeCredit          = removeCredit;
		self.removeAllPayments     = removeAllPayments;
		self.paymentDialog         = paymentDialog;
		self.addCredit             = addCredit;
		self.recalcPayments        = recalcPayments;
		self.showModalSeller       = showModalSeller;
		self.showModalCustomer     = showModalCustomer;
		self.showModalCustomerInfo = showModalCustomerInfo;
		self.showModalProduct      = showModalProduct;
		self.showModalNotes        = showModalNotes;
		self.showModalDiscount     = showModalDiscount;
		self.goToSection           = goToSection;
		self.showModalOrderSeller  = showModalOrderSeller;
		self.showLockModal         = showLockModal;

		function validateBudgetToSave(callback) {
			/*if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
				$rootScope.customDialog().showMessage('Erro', 'Este orçamento já foi exportado e não pode mais ser editado!');
				return false;
			}*/

			if (!self.budget.order_company_id) {
				$rootScope.customDialog().showMessage('Erro', 'A empresa do orçamento deverá ser informada!');
				return false;
			}

			if (!self.budget.order_items.length) {
				$rootScope.customDialog().showMessage('Erro', 'O orçamento deverá conter ao menos um produto!').then(function(success){

				},function(error){					
					self.focusOn('input[name="product-code"]');
				});
				self.scrollTo('section[name="products"]');		
				return false;
			}

			if (!self.budget.order_seller_id) {
				$rootScope.customDialog().showMessage('Erro', 'O vendedor deverá ser informado!').then(function(success){

				},function(error){
					self.focusOn('input[name="seller-code"]');
				});
				self.scrollTo('section[name="seller"]');		
				return false;
			}

			if (!self.budget.order_client_id) {
				$rootScope.customDialog().showMessage('Erro', 'O cliente deverá ser informado!').then(function(success){

				},function(error){
					self.focusOn('input[name="customer-code"]');
				});
				self.scrollTo('section[name="customer"]');		
				return false;
			}			

			if (!self.budget.order_address_delivery_code) {
				$rootScope.customDialog().showMessage('Erro', 'Informe o endereço de entrega do pedido!').then(function(success){

				},function(error){
					self.scrollTo('section[name="customer"]');
					$scope.teste();
				});
				self.scrollTo('section[name="customer"]');			
				return false;
			}

			if (self.budget.getChange() > 0 && self.budget.order_payments.length) {
				$rootScope.customDialog().showMessage('Erro', 'Reveja os valores de pagamento!');
				self.scrollTo('section[name="payment"]');
				return false;	
			}

			var debtor = 0;
			var authorized_modality_id = Globals.get('credit-limit').split(',');
			var today = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
			for (var i = 0; i < self.budget.order_payments.length; i++) {
				if (moment(self.budget.order_payments[i].order_payment_deadline).isBefore(today)) {
					$rootScope.customDialog().showMessage('Erro', 'Não é possível salvar o orçamento pois o mesmo contém ao menos uma forma de pagamento com data anterior à data de hoje.');
					return false;
				}
				if( authorized_modality_id.indexOf(self.budget.order_payments[i].modality_id) == -1 ){
					debtor += self.budget.order_payments[i].order_payment_value_total;
				}
			}
			
			if( !self.budget.order_audit.user_id && debtor > 0 && ( self.budget.order_client.person_credit_limit.blocked_days_limit == 1 || debtor > self.budget.order_client.person_credit_limit.person_credit_limit_balance ) ){
				authorizeCredit().then(function(success){
					if( success.user_max_credit_authorization > 0 ){
						self.setOrderAudit({
							title: self.budget.order_client.person_credit_limit.blocked_days_limit == 1 ? 'Liberação de títulos vencidos' : 'Liberação de crédito',
							user_id: success.user_id,
							user_name: success.user_name,
							person_name: self.budget.order_client.person_name,
							person_code: self.budget.order_client.person_code
						});
						// $scope.save();
						callback && callback();
					}
				}, function(error){
					$rootScope.customDialog().showMessage('Erro', 'Não autorizado!')
						.then(function(success) {
							callback && callback();
						}, function(error) { });
				});
				return false;
			}

			return true;
		}

		function validateBudgetToExport() {
			// if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
			// 	$rootScope.customDialog().showMessage('Erro', 'Este orçamento já foi exportado!');
			// 	return;
			// }

			if (!self.budget.order_payments.length) {
				$rootScope.customDialog().showMessage('Erro', 'O orçamento precisa ter ao menos uma forma de pagamento informada!');
				self.scrollTo('section[name="payment"]');
				return false;
			}

			if (self.budget.order_payments.find(function(p) {
				return !p.order_payment_value_total || p.order_payment_value_total <= 0;
			})) {
				$rootScope.customDialog().showMessage('Erro', 'Não é possível usar pagamentos com valores zerados.');
				self.scrollTo('section[name="payment"]');
				return false;
			}

			if (self.budget.getChange() != 0) {
				$rootScope.customDialog().showMessage('Erro', 'Reveja os valores dos pagamentos!');
				self.scrollTo('section[name="payment"]');
				return false;
			}

			return true;
		}

		function filterBudget() {
			return angular.merge({ }, self.budget, {
				// address_delivery: null,
				order_address: null,
				order_client: {
					person_active: null,
					person_address: null,
					person_credit: null,
					person_credit_limit: null,
					queryable: null
				},
				order_company: null,
				order_mail_sent: null,
				order_seller: null,
				order_user: null,
				queryable: null,
				order_items: self.budget.order_items.map(function(i) {
					i.price = null;
					// i.product = null;
					i.user_price = null;
					return i;
				}),
			});
		}

		$scope.$on('$destroy', function() {
			if (constants.isElectron) {
				unbindKeys();
			}

			$location.search('source', null);
		});

		$scope.isLocked = function(target) {
			console.log(target);
			jQuery(target).hasClass('disabled');
		};

		$scope.clone = function() {
			if (!self.canSave()) {
				$location.path('/order/clone/' + self.budget.order_code);
			} else {
				$rootScope.customDialog().showConfirm('Aviso', 'As alterações serão perdidas, deseja continuar?')
					.then(function(success) {
						$location.path('/order/clone/' + self.budget.order_code);
					}, function(error) { });
			}
		};

		$scope.$on('$viewContentLoaded', function() {
			$timeout(function() {
				jQuery('section[name="seller"] input').addClass('mousetrap').on('focus', function() { _focusOn = 'seller' });
				jQuery('section[name="products"] input').addClass('mousetrap').on('focus', function() { _focusOn = 'products' });
				jQuery('section[name="customer"] input').addClass('mousetrap').on('focus', function() { _focusOn = 'customer' });
				jQuery('section[name="notes"] textarea').addClass('mousetrap').on('focus', function() { _focusOn = 'notes' });
				jQuery('section[name="payment"] input').addClass('mousetrap').on('focus', function() { _focusOn = 'payment' });

				self.focusOn('input[name=\'product-code\']');
			}, 200);

			self.searchTerm();

			/************** 
			 * EDIT
			 * CLONE
			 * NEW
			 **************/
			if (!!$routeParams.action && $routeParams.action == 'edit' && !!$routeParams.param) {
				var options = {
					getCompany: true,
					getUser: true,
					getCustomer: true,
					getCreditLimit: true,
					getSeller: true,
					getItems: true,
					getPayments: true,
					getTerm: true,
					getProductPrice: true,
					getProductStock: true
				};

				$rootScope.loading.load();
				providerOrder.getByCode($routeParams.param, options).then(function(success) {
					self.budget = new Order(success.data);
					OpenedOrderManager.add(self.budget.order_code);

					self.showLockModal();

					/* Configura a barra de titulo interna do Commercial */
					// $rootScope.titleBarText = 'Editar orçamento - Código: ' + self.budget.order_code + ' (' + $filter('date')(self.budget.order_date, 'short') + ')';
					if (constants.isElectron)
						_remote.getCurrentWindow().setTitle('Editar orçamento - Código: ' + self.budget.order_code + ' (' + $filter('date')(self.budget.order_date, 'short') + ')');
					
					/* copia os valores para as variaveis temporarias dos autocompletes */
					self.internal.tempSeller = new Person(self.budget.order_seller);					
					self.internal.tempCustomer = new Person(self.budget.order_client);

					/* copia o endereco de entrega para o corpo do orcamento */
					self.budget.address_delivery = new Address(self.budget.order_client.person_address.find(function(a) {
						return a.person_address_code == self.budget.order_address_delivery_code;
					}));

					if (self.budget.order_term_id) {
						$rootScope.loading.load();
						providerTerm.getById(self.budget.order_term_id, { getModality: true }).then(function(success) {
							self.internal.term.tempTerm = new Term(success.data);
							self.internal.term.backup = new Term(success.data);
							/* Cria uma copia de backup para saber se o orcamento foi modificado no final */
							_backup = new Order(self.budget);
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
						});
					} else {
						_backup = new Order(self.budget);
					}

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
			} else if (!!$routeParams.action && $routeParams.action == 'clone' && !!$routeParams.param) {
				var options = {
					getCompany: true,
					getCustomer: true,
					getCreditLimit: true,
					getSeller: true,
					getItems: true,
					getProductStock: true,
					getPayments: true
				}, code = $routeParams.param;

				console.log(code);

				$rootScope.loading.load();
				providerOrder.getByCode(code, options).then(function(success) {
					var temp = new Order(success.data);
					temp.order_id = null;
					temp.order_erp_id = null;
					temp.order_user_id = null;
					temp.order_status_id = Globals.get('order-status-values')['open'];
					temp.order_term_id = null;
					temp.order_origin_id = null;
					temp.order_code = null;
					temp.order_code_erp = null;
					temp.order_code_document = null;
					temp.order_mail_sent = [];
					temp.order_update = null;
					temp.order_date = null;
					temp.creditPayment = null;
					temp.order_audit = null;
					temp.order_credit = null;
					temp.order_value_icms = null;
					temp.order_value_st = null;
					temp.status = null;
					temp.order_audit_discounts = [];

					temp.order_items = temp.order_items.map(function(i) {
						i.order_item_al_discount = 0;
						i.order_item_vl_discount = 0;
						return i;
					});

					if (success.data.order_credit === 'Y') {
						temp.order_payments.shift();
					}

					temp.order_payments = temp.order_payments.map(function(p) {
						p.order_payment_id = null;
						p.order_id = null;
						p.order_payment_erp_id = null;

						return p;
					});

					self.budget = new Order(temp);
					self.recalcPayments();

					if (constants.isElectron)
						_remote.getCurrentWindow().setTitle('Novo orçamento');
					$rootScope.titleBarText = 'Novo orçamento';

					$scope.isDisabled = false;
					self.internal.flags.showInfo = true;

					/* copia os valores para as variaveis temporarias dos autocompletes */
					self.internal.tempSeller = new Person(self.budget.order_seller);
					self.internal.tempCustomer = new Person(self.budget.order_client);

					/* copia o endereco de entrega para o corpo do orcamento */
					self.budget.address_delivery = new Address(self.budget.order_client.person_address.find(function(a) {
						return a.person_address_code == self.budget.order_address_delivery_code;
					}));

					$rootScope.loading.unload();
				}, function(error) {
					console.error(error);
					$rootScope.loading.unload();
				});

				/* Cria uma copia de backup para saber se o orcamento foi modificado no final */
				_backup = new Order(self.budget);
			} else if (!!$routeParams.action && $routeParams.action == 'new') {
				if (constants.isElectron)
					_remote.getCurrentWindow().setTitle('Novo orçamento');
				$rootScope.titleBarText = 'Novo orçamento';

				$scope.isDisabled = false;
				self.internal.flags.showInfo = true;

				if ($routeParams.param) {
					console.log('pegando empresa', $routeParams.param);
					var company = Globals.get('user-companies-raw').find(function(company) {
						return company.company_id == $routeParams.param;
					});

					self.budget.setCompany(new UserCompany(company).company_erp);
				}

				if (!self.budget.order_company_id) {
					/* Seleciona a empresa principal */
					var company = Globals.get('user-companies-raw').find(function(company) {
						return company.user_company_main == 'Y';
					});
					self.budget.setCompany(new UserCompany(company).company_erp);
				}

				// if( Globals.get('user')['user_seller'].person_id ) {
				// 	self.budget.setSeller(new Person(Globals.get('user')['user_seller']));
				// 	self.internal.tempSeller = new Person(Globals.get('user')['user_seller']);
				// }

				/* Cria uma copia de backup para saber se o orcamento foi modificado no final */
				_backup = new Order(self.budget);
			} else {
				$location.path('/');
			}

			$timeout(function() { $scope.$broadcast('orderViewLoaded'); });
		});

		$scope.newOrder = function(skip) {
			// if (self.budget.order_status_id != Globals.get('order-status-values')['open']) {
			if (!self.canSave() || !!skip) {
				newOrder();
			} else {
				$rootScope.customDialog().showConfirm('Aviso', 'Deseja descartar o orçamento atual?')
					.then(function(success) {
						newOrder();
					}, function(error) { });
			}
		};

		$scope.open = function(skip) {
			if (!self.canSave() || !!skip) {
				$location.path('/open-order');
			} else {
				$rootScope.customDialog().showConfirm('Aviso', 'Deseja descartar o orçamento atual?')
					.then(function(success) {
						$location.path('/open-order');
					}, function(error) { });	
			}
		};

		$scope.close = function(skip) {
			if (!constants.isElectron) {
				$scope.open(skip);
				return;
			}

			function closeWindow() {
				OpenedOrderManager.remove(self.budget.order_code);

				_ipcRenderer.send('redeem', {
					guid: GUID.get()
				});

				_remote.getCurrentWindow().close();
			}

			if (!self.canSave() || !!skip) {
				_preventClosing = false;
				closeWindow();
			} else {
				$rootScope.customDialog().showConfirm('Aviso', 'Todas as alterações não salvas serão perdidas. Deseja continuar?')
					.then(function(success) {
						_preventClosing = false;
						closeWindow();
					}, function(error) { });
			}
		}

		$scope.save = function() {
			self.showModalOrderSeller(save);
		};

		function soldOutWarning() {
			var message = '';

			for (var i = 0; i < self.budget.order_items.length; i++) {
				if (self.budget.order_status_id == self.internal.orderStatusValues.open &&
					self.budget.order_items[i].product.stock.product_stock <= 0) {
					message += '<br><br><div class="well">';
					message += '<span class="text-danger">ATENÇÃO</span><br><br>';
					message += 'Este orçamento possui 1 ou mais itens sem estoque.';
					message += '</div>';

					break;
				}
			}

			return message;
		}

		function save() {

			if (_backup && self.budget.equals(_backup)) {
				$rootScope.customDialog().showMessage('Aviso', 'Nenhuma alteração!');
				return;
			}

			if (!validateBudgetToSave(save)) {
				return;
			}

			if (self.budget.order_status_id == Globals.get('order-status-values').exported) {
				if (!validateBudgetToExport()) {
					return;
				}
			}

			if (self.budget.creditPayment && self.budget.order_status_id == 1001 ) {
				$rootScope.customDialog().showMessage('Aviso', 'Este orçamento está utilizando uma Carta de Crédito como forma de pagamento e por isso não é mais possível salvá-lo, você ainda pode exportá-lo.');
				return;		
			}

			$rootScope.customDialog().showConfirm('Aviso', 'Deseja salvar o orçamento atual?' + soldOutWarning())
				.then(function(success) {
					var filtered = filterBudget();

					constants.debug && console.log('salvando orçamento: ', filtered);

					function afterSave(msg) {
						var controller = function() {
								this._showCloseButton = true;
								this.order_code = self.budget.order_code;
								this.order_code_erp = self.budget.order_code_erp;
								this.order_export_type = self.budget.order_export_type;
								this.msg = msg;
								this.timer = 10;

								this.tick = function() {
									var scope = this;
									$timeout(function() {
										scope.timer --;
										if (scope.timer <= 0) {
											$scope.close(true);
										} else {
											scope.tick();
										}
									}, 1000);
								};

								this.tick();
							};

						_backup = self.budget;
						self.internal.flags.printable = true;
						self.propagateSaveOrder(self.budget.order_company_id);

						$rootScope.customDialog().showTemplate('Sucesso', './partials/modalOrderSaved.html', controller)
							.then(function(res) {
								switch (res) {
									case 'print': {
										self.print().then(function() {
											if (constants.isElectron) {
												_ipcRenderer.send('killme', {
													winId: _remote.getCurrentWindow().id,
													ttl: 1000
												});
											}
										});
										break;
									}

									case 'cupon': {
										self.print('cupon').then(function() {
											if (constants.isElectron) {
												_ipcRenderer.send('killme', {
													winId: _remote.getCurrentWindow().id,
													ttl: 1000
												});
											}
										});
										break;
									}
									
									case 'mail': {
										self.mail().then(function(win) {
											if (constants.isElectron) {
												_ipcRenderer.send('killme', {
													winId: _remote.getCurrentWindow().id,
													ttl: 1000
												});
											}
										});
										break;
									}
									
									case 'order': {
										exportOrder(true).then(function(success) {
											/*$timeout(function(){
												$scope.close(true);
											},1000);*/
										}, function(error) {
											/*$timeout(function(){
												$scope.close(true);
											},1000);*/
										});
										break;
									}
									
									case 'dav': {
										exportDAV(true).then(function(success) {
											/*$timeout(function(){
												$scope.close(true);
											},1000);*/
										}, function(error) {
											/*$timeout(function(){
												$scope.close(true);
											},1000);*/
										});;
										break;
									}
								}
							}, function(res) {
								$timeout(function(){
									$scope.close(true);
								},1000);
							});
					}

					$rootScope.loading.load();
					if (self.budget.order_code && self.budget.order_id) {
						/* Edita o orcamento */
						providerOrder.edit(filtered).then(function(success) {
							$rootScope.loading.unload();

							/* Modal de confirmacao */
							afterSave('Orçamento editado!');
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
							self.budget.order_date = moment().tz('America/Sao_Paulo').toDate();
							$rootScope.loading.unload();

							/* Modal de confirmacao */
							afterSave('Orçamento salvo!');
						}, function(error) {
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					}

					self.budget.removeAudit();
				}, function(error) {
					self.budget.removeAudit();
				});
		};

		function internalItems() {
			return {
				userPrices: Globals.get('user-prices-raw'),
				tempSeller: null,
				tempCustomer: null,
				tempAddress: new Address(),
				tempProduct: null,
				tempPrice: null,
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
					backup: null,
					tempTerm: new Term(),
					queryTerm: '',
					queryResult: new Array(),
					updateSearch: function(e) {
						e.stopPropagation();
					},
					clear: function() {
						self.internal.term.tempTerm = new Term();
						self.internal.term.queryTerm = '';
						self.internal.term.backup = null;
					},
					restoreBackup: function() {
						self.internal.term.tempTerm = new Term(self.internal.term.backup);
					}
				},
				orderStatusValues: Globals.get('order-status-values'),
				orderStatusLabels: Globals.get('order-status-labels'),
				orderStatusColor: Globals.get("order-status-colors"),
				flags: {
					isToolbarLocked: false,
					printable: false,
					showInfo: false
				}
			};
		}

		function getMainUserPriceId() {
			return Globals.get('user-prices-raw').find(function(up) {
				return up.user_price_main == 'Y';
			});
		}

		// ******************************
		// Methods declaration
		// ******************************

		/**
		 * Verifica se a barra de tarefas esta trancada.
		 */
		function isToolbarLocked() {
			return self.internal.flags.isToolbarLocked;
		}

		/**
		 * Verifica se o orcamento pode ser salvo.
		 */
		function canSave() {
			var isEqualsBackup = _backup && self.budget ? self.budget.equals(_backup) : false;
			return !isEqualsBackup && self.budget.order_company_id && self.budget.order_status_id != self.internal.orderStatusValues.billed && self.budget.status.editable == 'Y';
		}

		/**
		 * Verifica se o orcamento pode ser exportado.
		 */
		function canExport() {
			return self.budget.order_company_id && self.budget.order_status_id == self.internal.orderStatusValues.open;
		}

		/**
		 * Verifica se o orcamento pode ser impresso.
		 */
		function canPrint() {
			if (self.internal.flags.printable)
				return true;

			if (isToolbarLocked())
				return false;

			return self.budget.order_code && (_backup && self.budget.equals(_backup));
		}

		/**
		 * Verifica se as informacoes do orcamento podem ser exibidas.
		 */
		function canShowInfo() {
			if (self.internal.flags.showInfo && $scope.isDisabled)
				return true;

			if (isToolbarLocked())
				return false;

			return true;
		}

		/**
		 * Verifica se o orcamento pode ter a empresa trocada.
		 */
		function canChangeCompany() {
			return self.budget.order_status_id == Globals.get('order-status-values').open;
		}

		/**
		 * Diz se o orcamento ja foi exportado.
		 */
		function isExported() {
			return self.budget.order_status_id != Globals.get('order-status-values').open;
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
				controller = function () { },
				options = {
					width: 900,
					hasBackdrop: true
				};

			controller.prototype = {
				newCustomer: new Person(person),
				_showCloseButton: true
			};

			self.internal.flags.isToolbarLocked = true;
			ModalNewPerson.show().then(function(res) {
				self.internal.flags.isToolbarLocked = false;
				self.getCustomerByCode(res.person_code);
			}, function(error) {
				self.internal.flags.isToolbarLocked = false;
			}); 
		}

		/**
		 * Adiciona um cliente ao pedido.
		 * @param {object} person - O cliente a ser adicionado.
		 */	
		function setCustomer(person) {
			self.budget.setCustomer(new Person(person));
			self.budget.order_address_delivery_code = null;
			self.internal.tempCustomer = new Person(person);
			self.removeCredit();
		}

		function setOrderAudit(audit) {
			self.budget.setOrderAudit(audit);			
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
			self.internal.tempPrice = new Price();
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
				self.budget.updateValues();
				clearProductSearch();
				self.recalcPayments();
			}, function() { });
		}

		/**
		 * Limpa os campos da sessao de vendedor.
		 */
		function clearCustomer(){
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
				self.clearTerm();
				self.budget.order_payments = new Array();
				self.clearTerm();
			}, function() { });
		}

		/**
		 * Limpa a pesquisa de prazo do campo de pagamento.
		 */
		function clearTerm() {
			self.internal.term.clear();	
			self.budget.order_term_id = null;
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
		 * Pesquisa o cliente pelo codigo.
		 * @param {string} code - O codio do cliente.
		 */
		function getCustomerByCode(code) {
			if (!code) {								
				code = Globals.get('default-customer').code;
			}

			if (code == self.budget.order_client.person_code || !parseInt(code))
				return;

			var options = { getAddress: true, getContact: true, getCredit: true, getLimit: true };
			
			$rootScope.loading.load();
			getPersonByCode(code, Globals.get('person-categories').customer, options).then(function(success) {
				var customer = new Person(success.data);
				
				if (customer.isActive) {
					$rootScope.customDialog().showMessage('Erro', 'Cliente inativo!');
					self.internal.tempCustomer = null;
					console.log('cliente inativo');
				} else {
					setCustomer(customer);
					if (self.budget.order_client.person_address.length) {
						self.budget.setDeliveryAddress(self.budget.order_client.person_address[0]);
					}
				}
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
				// self.focusOn('input[name="autocompleteProduct"]');
				return;
			}

			if (code == self.internal.tempItem.product.product_code) {
				self.focusOn('input[name="amount"]');
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
				if (success.data.product_active == 'N') {
					$rootScope.customDialog().showMessage('Aviso', 'Produto inativo!');
					$rootScope.loading.unload();
					return;
				}

				if (!success.data.product_prices || !success.data.product_prices.length) {
					$rootScope.customDialog().showMessage('Aviso', 'Produto sem preço!');
					$rootScope.loading.unload();
					return;
				}

				self.internal.tempProduct = new Product(success.data);
				self.internal.tempItem.setProduct(new Product(success.data));
				self.internal.tempPrice = new Price(self.internal.tempItem.price);
				
				self.setItemAmount(1);
				
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
					getUnit: true,
					getActiveOnly: true
				};

			providerProduct.getByName(name, self.budget.order_company_id, self.internal.tempItem.price_id, options)
				.then(function(success) {
					deferred.resolve(success.data.map(function(p) { return new Product(p); }));
				}, function(error) {
					constants.debug && console.log(error);
					deferred.resolve([ ]);
				});

			return deferred.promise;
		}

		/**
		 * Seleciona a tabela de precos do item.
		 * @param {object} price - A tabela de precos.
		 */
		function priceTableChanged(price) {
			if (self.internal.tempItem.price.equals(price)) return;

			if (self.internal.tempItem.order_item_al_discount > 0) {
				var msg = 'Ao trocar a tabela de preços o desconto será removido do item. Deseja continuar?';

				$rootScope.customDialog().showConfirm('Aviso', msg)
					.then(function(success) {
						self.internal.tempItem.setAlDiscount(0);
						self.internal.tempItem.removeAudit();
						self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
						self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
						
						self.priceTableChanged(price);
					}, function(error) { 
						self.internal.tempPrice = new Price(self.internal.tempItem.price); 
					});

				return;
			}

			console.log(price);
			self.internal.tempItem.setPrice(price);
		}

		/**
		 * Adiciona a quantidade de items e recalcula o desconto.
		 * @param {int} amount - A quantidade de itens.
		 */
		function setItemAmount(amount) {
			console.log(self.internal.tempItem.order_item_amount, amount);
			self.internal.tempItem.setAmount(amount);
			self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
		}

		/**
		 * Aplica uma aliquota de desconto no item atual.
		 * @param {float} value - O valor do desconto.
		 */
		function setItemAlDiscount(value) {
			value = parseFloat(value);

			if (self.internal.tempItemAlDiscount == self.internal.tempItem.order_item_al_discount && 
				self.internal.tempItemVlDiscount == self.internal.tempItem.order_item_vl_discount) {				
				self.focusOn("input[name=\'vl-discount\']");
				return;
			}

			var max = parseFloat(Globals.get('user-max-discount') || 0),
				productMaxAl = self.internal.tempItem.product.product_max_discount,
				setAl = function(al) {
					self.internal.tempItem.setAlDiscount(al);
					self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
					self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
				};

			if (value > productMaxAl) {
				authorizeDiscount(value, productMaxAl).then(function(success) {
					if (value > success.user_max_discount) {
						$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
						setAl(self.internal.tempItem.order_item_al_discount);
						self.focusOn("input[name=\'al-discount\']");
					} else {
						self.internal.tempItem.setAudit({
							user_id: success.user_id,
							user_name: success.user_name,
							product_code: self.internal.tempItem.product.product_code,
							product_name: self.internal.tempItem.product.product_name,
						});
						setAl(value);
						self.focusOn("input[name=\'vl-discount\']");
					}
				}, function(error) {
					setAl(self.internal.tempItem.order_item_al_discount);
					self.focusOn("input[name=\'al-discount\']");
				});
			} else {
				setAl(value);
				self.internal.tempItem.removeAudit();
				self.focusOn("input[name=\'vl-discount\']");
			}
		}

		/**
		 * Aplica um valor de desconto no item atual.
		 * @param {float} value - O valor do desconto.
		 */
		function setItemVlDiscount(value) {
			var currentAl = self.internal.tempItem.getValue() == 0 ? 0 : (parseFloat(value) * 100) / self.internal.tempItem.getValue(),
				maxAl = parseFloat(Globals.get('user-max-discount') || 0),
				productMaxAl = self.internal.tempItem.product.product_max_discount,
				setVl = function(vl) {
					self.internal.tempItem.setVlDiscount(vl);
					self.internal.tempItemAlDiscount = self.internal.tempItem.order_item_al_discount;
					self.internal.tempItemVlDiscount = self.internal.tempItem.order_item_vl_discount;
				};

			if (self.internal.tempItemAlDiscount == self.internal.tempItem.order_item_al_discount && 
				self.internal.tempItemVlDiscount == self.internal.tempItem.order_item_vl_discount) {
				self.addItem();
				return;
			}

			if (currentAl > productMaxAl) {
				authorizeDiscount(currentAl, productMaxAl).then(function(success) {
					if (currentAl > success.user_max_discount) {
						$rootScope.customDialog().showMessage('Não autorizado', 'Desconto acima do permitido.');
						setVl(self.internal.tempItem.order_item_vl_discount);
						self.focusOn("input[name=\'vl-discount\']");
					} else {
						self.internal.tempItem.setAudit({
							user_id: success.user_id,
							user_name: success.user_name,
							product_code: self.internal.tempItem.product.product_code,
							product_name: self.internal.tempItem.product.product_name,
						});
						setVl(value);
						self.addItem();
					}
				}, function(error) {
					setVl(self.internal.tempItem.order_item_vl_discount);
					self.focusOn("input[name=\'vl-discount\']");
				});
			} else {
				setVl(value);
				self.addItem();
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
		 * Abre um modal para autorizar uma acao.
		 * @param {object} data - Os elementos a serem incorporados no modal.
		 * @param {string} module - O modulo do qual a permissao pertence.
		 * @param {string} access - O nome da permissao.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function authorizationDialog(title, data, module, access) {
			var deferred = $q.defer(),
				options = null;

			function controller($rootScope, providerPermission, Audit) {
				var ctrl = this;

				if (data.ctrl) {
					for (var x in data.ctrl) {
						ctrl[x] = data.ctrl[x];
					}
				}

				this.title     = data.title && data.title;
				this.text      = data.msg && data.msg;
				this.icon      = data.icon && data.icon;
				this.template  = data.template && data.template;
				this.user      = null;
				this.pass      = null;
				this.authorize = authorize;
				this.advance   = function() {
					jQuery('input[ng-model=\'ctrl.pass\']').focus();
				};

				$timeout(function() {
					jQuery('input[ng-model=\'ctrl.user\']').focus();
				}, 300);


				function authorize(user, pass, callback) {
					if (!user || !pass) return;

					$rootScope.loading.load();
					providerPermission.authorize(module, access, user, pass).then(function(success) {
						$rootScope.loading.unload();
						ctrl._close(success.data);
					}, function(error) {
						$rootScope.loading.unload();
						$rootScope.customDialog().showMessage('Erro', error.data.status.description);
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
			
			$rootScope.customDialog().showTemplate(title, './partials/modalAuthorization.html', controller, options)
				.then(function(success) {
					deferred.resolve(success);
				}, function(error) {
					deferred.reject();
				});

			return deferred.promise;
		}

		/**
		 * Abre um modal para autorizar o desconto do item.
		 * @param {float} value - O valor do desconto.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function authorizeDiscount(value, allowed) {			
			var msg = { },
				dummy = new OrderItem(self.internal.tempItem),
				html = ''; 

			dummy.setAlDiscount(value);

			html += '<div style="margin-left: 5px; max-width: 250px">';
			html += dummy.product.product_name + '<br><span class="text-primary">';
			html += 'Quantidade: ' + dummy.order_item_amount + '<br>';
			html += 'Desconto: ' + dummy.order_item_al_discount + '% / ';
			html += $filter('currency')(dummy.order_item_vl_discount, 'R$ ') + '<br>';
			html += 'Total: ' + $filter('currency')(dummy.order_item_value_total, 'R$ ');
			html += '</span></div>';

			msg = {
				title: 'Desconto máximo permitido: ' + allowed.toFixed(2) + '%',
				msg: html,
				icon: 'fa-2x fa-exclamation-triangle text-warning'
			};

			return self.authorizationDialog('Orçamento', msg, 'order', 'user_discount');
		}

		function authorizeCredit() {
			var data = {};
			
			data.template = '<div><div ng-init="in = false"><button ng-click="in = !in">oi</button></div><div ng-include="\'../partials/customer-receivables.html\'" ng-class="{ \'in\': in }"></div></div>';
			
			if( self.budget.order_client.person_credit_limit.blocked_days_limit == 1 ){
				data.title = 'Títulos em aberto';
				data.msg = 'Motivo: O cliente possui títulos vencidos em aberto.';
				data.icon = 'fa-2x fa-exclamation-triangle text-danger';
			} else{
				data.title = 'Limite de crédito';
				data.msg = 'Motivo: O valor da compra ultrapassa o limite de crédito.';
				data.icon = 'fa-2x fa-exclamation-triangle text-warning';
			}

			data.ctrl = {
				grid: {
					propertyName: 'receivable_delay',
					reverse: true
				},
				sortBy: function(propertyName){
					this.grid.reverse = (this.grid.propertyName === propertyName) ? !this.grid.reverse : false;
					this.grid.propertyName = propertyName;
				},
				receivables: self.budget.order_client.person_credit_limit.receivables,
				debit_day_limit: Globals.get('debit-day-limit')
			};

			return self.authorizationDialog('Orçamento', data, 'order', 'user_credit_authorization');
		}

		/**
		 * Edita um item da tabela de items do orcamento.
		 * @param {object} item - O item a ser editado.
		 */
		function editItem(item) {
			if ($scope.isDisabled)
				return;

			if (!item.product.product_prices.find(function(p) { return p.price_id == item.price_id })) {
				var msg = 'Este item está usando uma tabela de preços restrita, ';
				msg += 'editá-lo fará com que tanto a tabela de preços quanto o desconto sejam removidos. Deseja continuar?';

				$rootScope.customDialog().showConfirm('Aviso', msg)
					.then(function(success) {
						item.setPrice(item.product.getDefaultPriceTable());
						item.setAlDiscount(0);
						item.removeAudit();
						self.editItem(item);
					}, function(error) { });

				return;
			}

			self.internal.tempItem = new OrderItem(item);
			self.internal.tempItemAlDiscount = item.order_item_al_discount;
			self.internal.tempItemVlDiscount = item.order_item_vl_discount;
			self.internal.tempPrice = new Price(self.internal.tempItem.price);
			self.internal.tempProduct = new Product(item.product);
			
			self.budget.removeItem(item);
			self.recalcPayments();
		}

		/**
		 * Adiciona o item temporario a lista de items do orcamento.
		 */
		function addItem() {
			self.focusOn('input[name="product-code"]');

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
					self.internal.tempPrice = new Price();
					self.internal.tempItem = new OrderItem({ price_id: getMainUserPriceId().price_id, user_price: getMainUserPriceId() });

					self.recalcPayments();
				}
			}, 100);
		}

		/**
		 * Remove um item da tabela de items do orcamento.
		 * @param {object} item - O item a ser removido.
		 */
		function removeItem(item) {
			if (!item)
				return;

			var message = 'Deseja remover o item? <br><br><b>';
			message += item.product.product_code + ' - ';
			message += item.product.product_name + '</b>';

			$rootScope.customDialog().showConfirm('Aviso', message)
				.then(function(success) {
					self.budget.removeItem(item);
					self.recalcPayments();
				}, function(error) { });
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
			if (!self.canPrint()) return;

			var deferred = $q.defer();

			var options = {
				parent: _remote.getGlobal('mainWindow').instance,
				webPreferences: {
					zoomFactor: 1
				}
			};

			if (constants.isElectron) {
				var win = ElectronWindow.createWindow('#/print/' + self.budget.order_code + '/pdf', options);

				$scope.$watch(function() {
					return win.isVisible();
				}, function(newVal, oldVal) {
					if (!!newVal) {
						deferred.resolve();
					}
				});
			} else {
				deferred.resolve();
				$location.path('/print/' + self.budget.order_code + '/pdf');
			}

			return deferred.promise();
		}

		/**
		 * Instancia uma nova janela e chama o dialogo de impressao.
		 */
		function print(type) {

			if (!self.canPrint()) return;

			var deferred = $q.defer();

			if (constants.isElectron) {
				var options = {
					parent: _remote.getGlobal('mainWindow').instance,
					webPreferences: {
						zoomFactor: 1
					}
				};

				var root = type == 'cupon' ? '#/cupon/' : (type == 'ticket' ? '#/ticket/' : '#/print/'),
					win = ElectronWindow.createWindow(root + self.budget.order_code, options);

				deferred.resolve();
			}
			else {
				deferred.resolve();
				var root = type == 'cupon' ? '/cupon/' : (type == 'ticket' ? '/ticket/' : '/print/');
				$location.path(root + self.budget.order_code);
			}

			return deferred.promise;
		}

		/**
		 * Instancia uma nova janela para envio de email.
		 */
		function mail() {
			if (!self.canPrint()) return;

			var deferred = $q.defer();

			if (constants.isElectron) {
				var options = {
					width: 920, 
					height: 650,
					resizeable: false,
					parent: _remote.getGlobal('mainWindow').instance,
					webPreferences: {
						zoomFactor: 1
					}
				};

				var win = ElectronWindow.createWindow('#/mail/' + self.budget.order_code, options);

				deferred.resolve();
			}
			else {
				deferred.resolve();
				$location.path('/mail/' + self.budget.order_code);
			}

			return deferred.promise;
		}

		/**
		 * Exibe um modal com aviso de 404 not found.
		 */
		function showNotFound() {
			$rootScope.customDialog().showMessage('Aviso', 'Nenhum resultado encontrado!');
		}

		/**
		 * Exibe um modal com os enderecos do cliente, e uma tela
		 * de cadastros de endereco, para selecionar o endereco de entrega.
		 */
		function addressDialog() {
			var options = {
				getCity: true,
				getDistrict: true,
				getContact: true
			};

			$rootScope.loading.load();
			providerAddress.getByPerson(self.budget.order_client.person_id, options).then(function(success) {
				$rootScope.loading.unload();
				var addresses = success.data.map(function(a) { return new Address(a) });

				self.internal.flags.isToolbarLocked = true;
				ModalCustomerAddress.show(angular.extend(self.budget.order_client, { person_address: addresses }), self.budget.address_delivery)
					.then(function(success) {
						self.budget.setDeliveryAddress(success);
						self.internal.flags.isToolbarLocked = false;
					}, function(error) {
						self.internal.flags.isToolbarLocked = false;
					});
			}, function(error) {
				$rootScope.loading.unload();
			});
		}

		/**
		 * Exibe um modal com os contatos do endereco.
		 * @param {object} array - um array com os contatos.
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
		 * Exibe um modal exibindo o codigo do orcamento exportado.
		 * @param {string} msg - A mensagem a ser exibida.
		 * @param {string} code - O codigo do orcamento exportado.
		 */		
		function afterExportDialog(msg, code) {
			var controller = function() {
					this._showCloseButton = true;
					this.code = code;
					this.msg = msg;
					this.timer = 10;

					this.tick = function() {
						var scope = this;
						$timeout(function() {
							scope.timer --;
							if (scope.timer <= 0) {
								$scope.close(true);
							} else {
								scope.tick();
							}
						}, 1000);
					};

					this.tick();
				};

			self.propagateSaveOrder(self.budget.order_company_id);
			// self.internal.flags.printable = true;

			$rootScope.customDialog().showTemplate('Sucesso', './partials/modalOrderExported.html', controller)
				.then(function(res) {
					switch (res) {
						case 'print': {
							self.print().then(function() {
								if (constants.isElectron) {
									_ipcRenderer.send('killme', {
										winId: _remote.getCurrentWindow().id,
										ttl: 1000
									});
								}
							});
							break;
						}

						case 'cupon': {
							self.print('cupon').then(function() {
								if (constants.isElectron) {
									_ipcRenderer.send('killme', {
										winId: _remote.getCurrentWindow().id,
										ttl: 1000
									});
								}
							});
							break;
						}

						case 'ticket': {
							self.print('ticket').then(function() {
								if (constants.isElectron) {
									_ipcRenderer.send('killme', {
										winId: _remote.getCurrentWindow().id,
										ttl: 1000
									});
								}
							});
							break;
						}
						
						case 'mail': {
							self.mail().then(function(win) {
								if (constants.isElectron) {
									_ipcRenderer.send('killme', {
										winId: _remote.getCurrentWindow().id,
										ttl: 1000
									});
								}
							});
							break;
						}
					}
				}, function(res) {
					$scope.close(true);
				});
		}

		/**
		 * Encapsula a funcao de exportar dentro do modal de vendedor.
		 */
		function exportOrder(skip) {
			if (skip) 
				return _exportOrder();
			else
				self.showModalOrderSeller(_exportOrder);
		}

		/**
		 * Exporta o orcamento para pedido.
		 */
		function _exportOrder() {
			if (!validateBudgetToSave(_exportOrder) || !validateBudgetToExport()) {
				return;
			}

			var deferred = $q.defer();

			$rootScope.customDialog().showConfirm('Aviso', 'Exportar pedido?' + soldOutWarning())
				.then(function(success) {
					constants.debug && console.log('exportando pedido: ' + self.budget.order_id);					

					$rootScope.loading.load();
					/* O orcamento ja esta salvo. */
					if (self.budget.order_id) {
						/* Nao foi editado. */
						if (!self.canSave()) {
							/* Apenas exporta. */
							providerOrder.exportOrder(self.budget.order_id).then(function(success) {
								self.budget.order_erp = success.data.budget_code;
								self.budget.order_status_id = Globals.get('order-status-values')['exported'];
								$rootScope.loading.unload();
								
								_backup = self.budget;
								self.internal.flags.printable = true;

								deferred.resolve(success);

								self.afterExportDialog('Orçamento exportado!', success.data.budget_code);
							}, function(error) {
								constants.debug && console.log(error);
								$rootScope.loading.unload();
								$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								deferred.reject(error);
							});
						} else {
							/* Edita e exporta. */
							providerOrder.editAndExportOrder(filterBudget()).then(function(success) {
								self.budget.order_erp = success.data.budget_code;
								self.budget.order_status_id = Globals.get('order-status-values')['exported'];
								$rootScope.loading.unload();
								
								_backup = self.budget;
								self.internal.flags.printable = true;

								deferred.resolve(success);
								
								self.afterExportDialog('Orçamento exportado!', success.data.budget_code);
							}, function(error) {
								constants.debug && console.log(error);
								$rootScope.loading.unload();
								$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								deferred.reject(error);
							});
						}
					} else {
						/* Novo orcamento, salva e exporta */
						providerOrder.saveAndExportOrder(filterBudget()).then(function(success) {
							self.budget.order_id = success.data.order_id;
							self.budget.order_code = success.data.order_code;
							self.budget.order_date = moment().tz('America/Sao_Paulo').toDate();
							self.budget.order_erp = success.data.budget_code;
							self.budget.order_status_id = Globals.get('order-status-values')['exported'];
							$rootScope.loading.unload();

							_backup = self.budget;
							self.internal.flags.printable = true;

							deferred.resolve(success);
							
							self.afterExportDialog('Orçamento exportado!', success.data.budget_code);
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
							deferred.reject(error);
						});
					}

					self.budget.removeAudit();
				}, function(error) {
					self.budget.removeAudit();
					deferred.reject();
				});

			return deferred.promise;
		}

		/**
		 * Encapsula a funcao de exportar dentro do modal de vendedor.
		 */
		function exportDAV(skip) {
			if (skip)
				return _exportDAV();
			else
				self.showModalOrderSeller(_exportDAV);
		}

		/**
		 * Exporta o orcamento para DAV.
		 */
		function _exportDAV() {
			if (!validateBudgetToSave(_exportDAV) || !validateBudgetToExport()) {
				return;
			}

			var deferred = $q.defer();

			$rootScope.customDialog().showConfirm('Aviso', 'Exportar DAV?' + soldOutWarning())
				.then(function(success) {
					constants.debug && console.log('exportando DAV: ' + self.budget.order_id);
					
					$rootScope.loading.load();
					/* O orcamento ja esta salvo. */
					if (self.budget.order_id) {
						/* Nao foi editado. */
						if (!self.canSave()) {
							/* Apenas exporta. */
							providerOrder.exportDAV(self.budget.order_id).then(function(success) {
								self.budget.order_erp = success.data.budget_code;
								self.budget.order_status_id = Globals.get('order-status-values')['exported'];
								$rootScope.loading.unload();
								
								_backup = self.budget;
								self.internal.flags.printable = true;

								deferred.resolve(success);

								self.afterExportDialog('Orçamento exportado!', success.data.dav_code);
							}, function(error) {
								constants.debug && console.log(error);
								$rootScope.loading.unload();
								$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								deferred.reject(error);
							});	
						} else {
							/* Edita e exporta. */
							providerOrder.editAndExportDAV(filterBudget()).then(function(success) {
								self.budget.order_erp = success.data.budget_code;
								self.budget.order_status_id = Globals.get('order-status-values')['exported'];
								$rootScope.loading.unload();
								
								_backup = self.budget;
								self.internal.flags.printable = true;
								
								deferred.resolve(success);
								
								self.afterExportDialog('Orçamento exportado!', success.data.dav_code);
							}, function(error) {
								constants.debug && console.log(error);
								$rootScope.loading.unload();
								$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								deferred.reject(error);
							});
						}
					} else {
						/* Novo orcamento, salva e exporta */
						providerOrder.saveAndExportDAV(filterBudget()).then(function(success) {
							$rootScope.loading.unload(success);
							self.budget.order_id = success.data.order_id;
							self.budget.order_code = success.data.order_code;
							// self.budget.order_date = moment().tz('America/Sao_Paulo').toDate();
							self.budget.order_erp = success.data.budget_code;
							self.budget.order_status_id = Globals.get('order-status-values')['exported'];
							
							_backup = self.budget;
							self.internal.flags.printable = true;

							deferred.resolve(success);
							
							self.afterExportDialog('Orçamento exportado!', success.data.dav_code);
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
							deferred.reject(error);
						});
					}

					self.budget.removeAudit();
				}, function(error) {
					self.budget.removeAudit();
				});

			return deferred.promise;
		}

		/**
		 * Atualiza o resultado da pesquisa de prazo.
		 */
		function searchTerm() {
			var options = {
				limit: 1000,
				getModality: false
			};

			providerTerm.getByDescription(self.internal.term.queryTerm, options).then(function(success) {
				self.internal.term.queryResult = success.data.map(function(t) { return new Term(t) });
			}, function(error) {
				constants.debug && console.log(error);
			});
		}		

		/**
		 * Atualiza o resultado da pesquisa de prazo.
		 */
		function getTermByCode(code) {
			if (!code) return;

			var options = {
				getModality: true
			};

			jQuery('input[name="term-code"]').blur();

			$rootScope.loading.load();
			providerTerm.getByCode(code, options).then(function(success) {
				self.internal.term.tempTerm = new Term(success.data);
				$rootScope.loading.unload();
				self.selectTerm();
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		/**
		 * Abre uma janela com as modalidades do prazo selecionado.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function selectTerm() {
			var controller = function() {
				this._showCloseButton = true;
				this.term = new Term(self.internal.term.tempTerm);
				this.value_total = self.budget.order_value_total;

				this.hoverIndex = -1;
				this.close = function() {
					if (this.hoverIndex >= 0)
						this._close(this.term.modality[this.hoverIndex]);
					else
						this._cancel();
				};

				if (constants.isElectron) {
					var scope = this;
					Mousetrap.bind('up', function() {
						$timeout(function() {
							scope.hoverIndex = Math.max(0, scope.hoverIndex - 1);
							jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
						});
						return false;
					});

					Mousetrap.bind('down', function() {
						$timeout(function() {
							scope.hoverIndex = Math.min(scope.term.modality.length - 1, scope.hoverIndex + 1);
							jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
						});
						return false;
					});	
				}

				jQuery('table[name="clementino"]').focus();

			};

			var options = {
				width: 400,
				focusOnOpen: false,
			};

			$rootScope.customDialog().showTemplate('Orçamento', './partials/modalTerm.html', controller, options)
				.then(function(success) {
					self.addModality(success);
					self.budget.order_term_id = self.internal.term.tempTerm.term_id;
					self.internal.term.queryTerm = '';
				}, function(error) { 
					self.internal.term.restoreBackup();

					if (constants.isElectron) {
						Mousetrap.unbind('up');
						Mousetrap.unbind('down');
					}
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
					var date = moment().tz('America/Sao_Paulo').toDate(),
						today = moment().tz('America/Sao_Paulo').toDate(),
						installment_delay = installment * interval;

					date.setDate(today.getDate() + delay + installment_delay);

					return date;
				};

				/* Trata primeiro para quando for cartao de credito */
				if (modality.modality_type == Globals.get('modalities')['credit-card'].type) {
					payments.push(new OrderPayment({
							order_id: self.budget.order_id,
							order_payment_value: self.budget.getChange(),
							order_payment_value_total: self.budget.getChange(),
							/* Checa se a modalidade é do tipo entrada e se é a primeira das parcelas para saber qual data inicial pegar. */
							order_payment_deadline: dateCalc(0, modality.modality_term_type == 'E' && i == 0 ? term.term_deposit_delay : term.term_delay, term.term_interval),
							order_payment_installment: term.term_installment,
							/* Checa se a modalidade é do tipo entrada e marca como inicial */
							order_payment_initial: modality.modality_term_type == 'E' ? 'Y' : 'N',
							modality_id: modality.modality_id,
							modality: new PaymentModality(modality)
						}));
				} else {
					/* armazena o valor total dos pagamentos, incluindo o credito, para colocar a diferença na ultima parcela */
					var total = self.budget.creditPayment ? self.budget.creditPayment.order_payment_value_total : 0;

					for (i = 0; i < term.term_installment; i++) {
						payments.push(new OrderPayment({
							order_id: self.budget.order_id,
							order_payment_value: parseFloat((self.budget.getChange() / term.term_installment).toFixed(2)),
							order_payment_value_total: parseFloat((self.budget.getChange() / term.term_installment).toFixed(2)),
							/* Checa se a modalidade é do tipo entrada e se é a primeira das parcelas para saber qual data inicial pegar. */
							order_payment_deadline: dateCalc(i, modality.modality_term_type == 'E' && i == 0 ? term.term_deposit_delay : term.term_delay, term.term_interval),
							order_payment_installment: 1,
							/* Checa se a modalidade é do tipo entrada e marca como inicial */
							order_payment_initial: i == 0 && modality.modality_term_type == 'E' ? 'Y' : 'N',
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
					self.internal.term.backup = new Term(self.internal.term.tempTerm);

					// Recoloca o credito novamente nos pagamentos
					if (self.budget.creditPayment) {
						self.budget.order_payments.unshift(self.budget.creditPayment);
					}

					add();
				}, function(error) {
					self.internal.term.restoreBackup();
				});
			} else {
				self.internal.term.backup = new Term(self.internal.term.tempTerm);
				add();
			}
		}

		/**
		 * Abre um modal de pesquisa de modalidades que retorna 
		 * um pagamento para ser adicionado ao orcamento.
		 */
		function addPayment() {
			if (self.budget.term_id) {
			// 	$rootScope.customDialog().showConfirm('Aviso', 'Para adicionar um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
			// 		.then(function(success) {
			//			self.budget.term_id = null;
			//			self.internal.term.clear();
			//			self.addPayment();
			// 		}, function(error) { });
			// 	return;
			}

			self.paymentDialog('Orçamento').then(function(success) {
				self.clearTerm();

				var payment = new OrderPayment(success);

				/* Se for selecionado como parcela inicial verifica se existe algum pagamento com data anterior. */
				if (payment.order_payment_initial == 'Y') {
					var i, flag;

					for (i = 0; i < self.budget.order_payments.length; i++) {
						if (self.budget.order_payments[i].order_payment_deadline.getTime() < payment.order_payment_deadline.getTime()) {
							flag = true;
							break;
						}
					}

					if (flag) {
						$rootScope.customDialog().showMessage('Aviso', 'Não foi possível colocar o pagamento como parcela inicial pois já existe um pagamento com uma data anterior.');
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
		 * @param {object} payment - O pagamento a ser editado.
		 */
		function editPayment(payment) {
			if ($scope.isDisabled)
				return;

			if (self.budget.term_id) {
			// 	$rootScope.customDialog().showConfirm('Aviso', 'Para editar um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
			// 		.then(function(success) {
			//			self.budget.term_id = null;
			//			self.internal.term.clear();
			//			self.editPayment(payment);
			// 		}, function(error) { });
			// 	return;
			}

			if (payment.order_payment_credit == 'Y') {
				self.addCredit();
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
				self.paymentDialog('Orçamento', temp).then(function(success) {
					self.clearTerm();

					var index = self.budget.order_payments.indexOf(payment),
						newPayment = new OrderPayment(success);

					/* Copiado do addPayment(). */
					if (newPayment.order_payment_initial == 'Y') {
						var i, flag;

						for (i = 0; i < self.budget.order_payments.length; i++) {
							if (self.budget.order_payments[i].order_payment_deadline.getTime() < newPayment.order_payment_deadline.getTime()) {
								flag = true;
								break;
							}
						}

						if (flag) {
							$rootScope.customDialog().showMessage('Aviso', 'Não foi possível colocar o pagamento como parcela inicial pois já existe um pagamento com uma data inferior.');
							newPayment.order_payment_initial = 'N';
						} else {
							/* Desmarca o atual incial. */
							angular.forEach(self.budget.order_payments, function(item) { item.order_payment_initial = 'N' });
						}
					}

					self.budget.order_payments[index] = newPayment;
				}, function(error) { });
			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		}

		/**
		 * Remove o pagamento informado.
		 * @param {string} id - O pagamento a ser removido.
		 */
		function removePayment(payment) {
			if (self.budget.term_id) {
			// 	$rootScope.customDialog().showConfirm('Aviso', 'Para remover um pagamento o prazo deve ser removido do orçamento. Deseja remover o prazo?')
			// 		.then(function(success) {
			//			self.budget.term_id = null;
			//			self.internal.term.clear();
			//			self.removePayment(payment);
			// 		}, function(error) { });
			// 	return;
			}

			var msg = 'Deseja remover o pagamento: <b>[';
			msg += payment.order_payment_installment + 'x] ';
			msg += payment.modality.modality_description + '</b>';

			$rootScope.customDialog().showConfirm('Aviso', msg).then(function(success) {
				self.clearTerm();

				var index = self.budget.order_payments.indexOf(payment);
				
				if (payment.order_payment_credit == 'Y')
					self.removeCredit();
				else
					self.budget.order_payments.splice(index, 1);
			}, function(error) { });
		}

		/**
		 * Remove o credito dos pagamentos e faz um post avisando o servidor.
		 */
		function removeCredit() {
			if (self.budget.creditPayment) {
				providerCredit.redeem(self.budget.creditPayment.credit.map(function(pc) { return pc.payable_id; }));
				self.budget.creditPayment = null;
				self.budget.order_payments.shift();
			}
		}

		/**
		 * Remove todos os pagamentos do orcamento
		 */
		function removeAllPayments() {
			self.clearTerm();
			
			var msg = 'Deseja remover todos os pagamentos?';

			$rootScope.customDialog().showConfirm('Aviso', msg).then(function(success) {
				self.removeCredit();
				self.budget.order_payments = new Array();
				self.budget.creditPayment = null;
			}, function(error) { });
		}

		/**
		 * Abre uma janela para a insercao ou edicao de uma forma de pagamento.
		 * @param {string} title - O titulo do modal.
		 * @param {object} payment - O pagamento a ser editado.
		 * @returns {object} - Uma promise com o resultado.
		 */
		function paymentDialog(title, payment) {

			function getModalities() {
				var deferred = $q.defer();

				providerModality.getByDescription(null, { limit: 1000 }).then(function(success) {
					deferred.resolve( success.data.map(function(m) { return new PaymentModality(m) }) );
				}, function(error) {
					constants.debug && console.log(error);
					deferred.reject();
				});

				return deferred.promise;
			};

			function getBanks() {
				var deferred = $q.defer();

				providerBank.getByName(null, { limit: 1000 }).then(function(success) {
					deferred.resolve( success.data.map(function(b) { return new Bank(b) }) );
				}, function(error) {
					constants.debug && console.log(error);
					deferred.reject();
				});

				return deferred.promise;
			};

			var deferred = $q.defer(),
				_modalities = [], 
				_banks = [],
				controller = function() {
					var scope = this;

					this._showCloseButton= true;
					this.isEditing = !!payment;
					this.modality = payment ? new PaymentModality(payment.modality) : null;
					this.payment = payment ? new OrderPayment(payment) : new OrderPayment({
						order_payment_value: self.budget.getChange(),
						order_payment_value_total: self.budget.getChange()
					});
					
					this.updateSearch = function(e) {
						e.stopPropagation();
					};

					/* Modalidade */
					this.queryModality = '';
					this.queryModalityResult = _modalities;

					this.getModalityById = function(id) {
						var scope = this,
							options = {
								companyId: self.budget.order_company_id,
								getInstallments: true
							};

						$rootScope.loading.load();
						providerModality.getById(id, options).then(function(success) {
							scope.queryModality = '';
							scope.payment.setModality(new PaymentModality(success.data));
							if (!scope.isEditing)
								scope.payment.order_payment_deadline = moment().add(scope.payment.modality.modality_item[0].modality_item_delay, 'days').toDate();
							
							/* Limpa os campos exclusivos do cheque quando troca o tipo da modalidade*/
							if (!scope.isCheck()) {
								scope.payment.order_payment_bank_id = null;
								scope.payment.order_payment_agency_id = null;
								scope.payment.order_payment_check_number = null;
							}

							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
						});
					};

					this.isCheck = function() {
						return this.modality && this.modality.modality_type == Globals.get('modalities')['check'].type;
					};

					/* Banco */
					this.queryBank = '';
					this.queryBankResult = _banks;
					this.tempBank = new Bank();

					this.getBankById = function(id) {
						$rootScope.loading.load();
						providerBank.getById(id, { getAgencies: true }).then(function(success) {
							scope.queryBank = '';
							scope.tempBank = new Bank(success.data);
							scope.payment.order_payment_agency_id = null;
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
						});
					};

					/* Starters */
					if (this.payment.order_payment_bank_id)
						this.getBankById(this.payment.order_payment_bank_id);
				};

			$rootScope.loading.load();
			$q.all([getModalities(), getBanks()]).then(function(res) {
				$rootScope.loading.unload();
				_modalities = res[0]; 
				_banks = res[1];

				$rootScope.customDialog().showTemplate(title, './partials/modalPayment.html', controller)
					.then(function(success) {
						deferred.resolve(success);
					}, function(error) {
						deferred.reject(error);
					});
			});

			return deferred.promise;
		}

		/**
		 * Abre uma janela para selecionar o credito.
		 */
		function addCredit() {
			constants.debug && console.log('creditos:', self.budget.order_client.person_credit);

			var controller = function() {
				this._showCloseButton = true;
				this.person = self.budget.order_client;
				this.viewOnly = !self.budget.order_items.length;

				this.creditArray = new Array();

				$rootScope.loading.load();
				var scope = this;
				providerCredit.get(this.person.person_id, { orderId: self.budget.order_id }).then(function(success) {
					scope.creditArray = success.data.map(function(c) {
						var newC = new PersonCredit(c);
						newC.checked = self.budget.creditPayment && !!self.budget.creditPayment.credit.find(function(pc) { return pc.payable_id == newC.payable_id; });
						return newC;
					});
					$rootScope.loading.unload();
				}, function(err) {
					constants.debug && console.log(err);
					$rootScope.loading.unload();
				});

				this.selectCredit = function(c) {
					if (this.viewOnly)
						return;

					if (c.credit_value_available < 0.01) {
						$rootScope.customDialog().showMessage('Aviso', 'Esta carta de crédito não possui valor disponível!');
						return;
					}

					if (!c.pawn) {
						c.checked = !c.checked;
					} else {
						var msg = 'Carta de crédito em uso por: <br><br>';
						msg += '<b>Usuário: </b>' + c.pawn.user_name + '<br>';
						msg += '<b>Módulo: </b>' + c.pawn.system_name + '<br>';
						msg += '<b>Descrição: </b>' + c.pawn.description;
						$rootScope.customDialog().showMessage('Aviso', msg);
					}
				};

				this.activeRow = null;
				this.tempNote = null;

				this.setActive = function(credit) {
					this.activeRow = this.person.person_credit.indexOf(credit);
					this.tempNote = credit.payable_note;
				};

				this.close = function() {
					if (this.viewOnly)
						return;

					var result = new Array(),
						pawned = { };

					angular.forEach(this.creditArray, function(item, index) {
						item.checked && result.push(new PersonCredit(item));
						pawned[item.payable_id] = item.checked ? 1 : 0;
					});

					var scope = this;
					$rootScope.loading.load();
					providerCredit.pawn(pawned).then(function(success) {
						scope._close(result);
						$rootScope.loading.unload();
					}, function(err) {
						constants.debug && console.log(err);
						$rootScope.loading.unload();
					});
				}
			};

			self.internal.flags.isToolbarLocked = true;
			$rootScope.customDialog().showTemplate('Cartas de crédito', './partials/modalCustomerCredit.html', controller, { zIndex: 1, innerDialog: true })
				.then(function(res) {
					self.internal.flags.isToolbarLocked = false;

					constants.debug && console.log('creditos selecionados: ', res);

					$rootScope.loading.load();
					/* Primeiro pega a modalidade carta de credito */
					providerModality.getByCode(Globals.get('modalities')['credit'].code, { getInstallments: true })
						.then(function(success) {
							/* Checa se o orcamento ja possui um pagamento credito e o remove */
							if (self.budget.creditPayment) {
								self.budget.order_payments.shift();
								self.budget.creditPayment = null;
							}

							/* Remove o prazo se nao tiver nenhuma forma de pagamento */
							if (self.budget.order_payments.length == 0)
								self.clearTerm();

							/* Checa se creditos foram retornados do modal.*/
							if (res.length) {
								var payment = new OrderPayment(),
									modality = new PaymentModality(success.data);

								payment.setModality(modality);
								payment.order_payment_deadline = moment().add(modality.modality_item[0].modality_item_installment, 'days').toDate();
								payment.order_payment_credit = 'Y';

								angular.forEach(res, function(pc) {
									payment.credit.push({
										payable_id: pc.payable_id,
										value: pc.credit_value_available
									});
									payment.order_payment_value += pc.credit_value_available;
									payment.order_payment_value_total += pc.credit_value_available;
									payment.order_payment_credit_available += pc.credit_value_available;
								});

								payment.order_payment_value = Math.min(payment.order_payment_value, self.budget.order_value);
								payment.order_payment_value_total = Math.min(payment.order_payment_value_total, self.budget.order_value_total);

								if (payment.order_payment_value_total >= self.budget.order_value_total) {
									self.budget.order_payments = new Array();
									self.clearTerm();
								}

								/* Adiciona o credito, no inicio do array, como forma de pagamento */
								self.budget.order_payments.unshift(payment);
								/* Adiciona uma referencia do credito no corpo do objecto orcamento */
								self.budget.creditPayment = payment;

								self.recalcPayments();
							} else {

							}

							$rootScope.loading.unload();
						}, function(error) { 
							constants.debug && console.log(error);
							$rootScope.loading.load();
						});					
					
				}, function(error) { 
					self.internal.flags.isToolbarLocked = false;
				});
		}

		/**
		 * Recalcula o valor dos pagamentos/parcelas.
		 */
		function recalcPayments() {
			/* Tenta sempre utilizar o valor todo do credito selecionado. */
			if (self.budget.creditPayment) {
				self.budget.creditPayment.order_payment_value = Math.min(self.budget.creditPayment.order_payment_credit_available, self.budget.order_value_total);
				self.budget.creditPayment.order_payment_value_total = Math.min(self.budget.creditPayment.order_payment_credit_available, self.budget.order_value_total);
			}

			var paymentLen = self.budget.order_payments.length - (self.budget.creditPayment ? 1 : 0),
				slice = (self.budget.order_value_total - (self.budget.creditPayment ? self.budget.creditPayment.order_payment_value_total : 0)) / paymentLen,
				total = self.budget.creditPayment ? self.budget.creditPayment.order_payment_value_total : 0,
				diff = 0, temp;

			if (paymentLen == 0)
				return;

			/* Evita parcelas com valores negativos. */
			/* Tambem abaixa o valor do credito caso necessario. */
			if (parseFloat(slice.toFixed(2)) <= 0) {
				self.budget.order_payments = new Array();
				self.clearTerm();

				if (self.budget.creditPayment) {
					self.budget.order_payments.unshift(self.budget.creditPayment);
				}

				return;
			}

			/* Evita dividir 1 centavo por mais de uma parcela */
			if (parseFloat(slice.toFixed(2)) < 0.01 && paymentLen > 1) {
				self.budget.order_payments = new Array();
				self.clearTerm();

				if (self.budget.creditPayment)
					self.budget.order_payments.unshift(self.budget.creditPayment);

				return;
			}

			for (var i = (self.budget.creditPayment ? 1 : 0); i < self.budget.order_payments.length; i++) {
				self.budget.order_payments[i].order_payment_value = parseFloat(slice.toFixed(2));
				self.budget.order_payments[i].order_payment_value_total = parseFloat(slice.toFixed(2));
				self.budget.order_payments[i].order_payment_al_discount = 0;
				self.budget.order_payments[i].order_payment_vl_discount = 0;
				total += self.budget.order_payments[i].order_payment_value_total;
			}

			diff = parseFloat((self.budget.order_value_total - total).toFixed(2));

			temp = self.budget.order_payments[self.budget.order_payments.length - 1].order_payment_value;
			self.budget.order_payments[self.budget.order_payments.length - 1].order_payment_value = parseFloat((temp + diff).toFixed(2));

			temp = self.budget.order_payments[self.budget.order_payments.length - 1].order_payment_value_total;
			self.budget.order_payments[self.budget.order_payments.length - 1].order_payment_value_total = parseFloat((temp + diff).toFixed(2));;
		}

		function showModalPerson(title, category, options) {
			return ModalPerson.show(title, category, options);
		}

		/**
		 * Exibe a tela de localizacao de vendedores.
		 */
		function showModalSeller() {
			var category = Globals.get('person-categories').seller,
				options = {
					module: 'Representante',
					limit: 100
				};

			jQuery('input[name="seller-code"]').blur();

			self.internal.flags.isToolbarLocked = true;
			showModalPerson('Localizar Vendedor', category, options)
				.then(function(success) {
					self.budget.setSeller(new Person(success));
					self.internal.tempSeller = new Person(success);
					self.internal.flags.isToolbarLocked = false;
				}, function(error) {
					self.internal.flags.isToolbarLocked = false;
				});
		}

		/**
		 * Exibe a tela de localizacao de clientes.
		 */
		function showModalCustomer() {
			var category = Globals.get('person-categories').customer,
				options = {
					module: 'Cliente',
					limit: 200
				};

			jQuery('input[name="customer-code"]').blur();

			self.internal.flags.isToolbarLocked = true;
			showModalPerson('Localizar Cliente', category, options)
				.then(function(success) {
					self.getCustomerByCode(success.person_code);
					self.internal.flags.isToolbarLocked = false;
				}, function(error){
					self.internal.flags.isToolbarLocked = false;
				});
		}

		/**
		 * Exibe a tela de informação de clientes.
		 */
		function showModalCustomerInfo() {
			/*var message = '';
			message += '<div style="margin-bottom:10px;"><b>Cliente</b>: ' + self.budget.order_client.person_code + ' - ' + self.budget.order_client.person_name + '</div>';
			message += '<b>Limite de crédito</b>: ' + self.budget.order_client.person_credit_limit.person_credit_limit_value + '<br/>';
			message += '<b>Títulos em aberto vencidos</b>: ' + self.budget.order_client.person_credit_limit.person_expired_quantity + '<br/>';
			message += '<b>Títulos em aberto a vencer</b>: ' + self.budget.order_client.person_credit_limit.person_expiring_quantity + '<br/>';
			message += '<div style="border-top:1px dashed black;margin-top:10px;padding-top:10px;"><b>Saldo de crédito</b>: ' + self.budget.order_client.person_credit_limit.person_credit_limit_balance + '</div>';
			$rootScope.customDialog().showMessage('Informação', message);*/
			var controller = function(){
				
				var vm = this;

				this._showCloseButton = true;
				this.client_code = self.budget.order_client.person_code;
				this.client_name = self.budget.order_client.person_name;
				this.person_credit_limit = self.budget.order_client.person_credit_limit;
				this.receivables = self.budget.order_client.person_credit_limit.receivables;
				this.debit_day_limit = Globals.get('debit-day-limit');

				this.grid = {
					propertyName: 'receivable_delay',
					reverse: true
				}

				this.sortBy = function(propertyName){
					vm.grid.reverse = (vm.grid.propertyName === propertyName) ? !vm.grid.reverse : false;
					vm.grid.propertyName = propertyName;
				};
			};

			$rootScope.customDialog().showTemplate('Orçamento', './partials/modalClientInfo.html', controller, { width: 720 })
				.then(function(success){

				}, function(error) { 

				});
		}

		/**
		 * Exibe a tela de localizacao de produtos.
		 */
		function showModalProduct() {
			var options = {
				getUnit: 1,
				getPrice: 1,
				getStock: 1,
				limit: 200
			};

			jQuery('input[name="product-code"]').blur();

			self.internal.flags.isToolbarLocked = true;
			ModalProduct.show('Localizar Produto',self.budget.order_company_id,getMainUserPriceId(),options)
				.then(function(success) {
					if (success.length == 1) {
						self.internal.tempProduct = new Product(success[0].product);
						self.internal.tempItem = success[0];
						self.internal.tempPrice = new Price(self.internal.tempItem.price);
						self.focusOn('input[name="amount"]');
					} else {
						angular.forEach(success, function(item, index) {
							self.budget.addItem(new OrderItem(item));
						});
					}
					
					self.internal.flags.isToolbarLocked = false;
				},function(error) {
					self.internal.flags.isToolbarLocked = false;
				});
		}

		/**
		 * Exibe a tela de observacoes do orcamento.
		 */
		function showModalNotes() {
			var controller = function() {
				this._showCloseButton = true;
				this.order_note = self.budget.order_note;
				this.order_note_doc = self.budget.order_note_doc;
				this.readonly = $scope.isDisabled;
			};

			$rootScope.customDialog().showTemplate('Orçamento', './partials/modalNotes.html', controller, { width: 500 })
				.then(function(success) {
					self.budget.order_note = success.order_note;
					self.budget.order_note_doc = success.order_note_doc;
				}, function(error) { });
		}

		/**
		 * Exibe a tela de desconto geral do orcamento.
		 */
		function showModalDiscount() {
			var _user = Globals.get('user'),
				controller, authorizedBy;

			controller = function() {
				this.user = _user;
				this.vl_discount = 0;
				this.al_discount = 0;
				this._showCloseButton = true;

				var scope = this;

				this.calcDiscountByAl = function(){
					$timeout(function() {
						scope.vl_discount = self.budget.order_value * (scope.al_discount/100);
					});
				}
				this.calcDiscountByVl = function(){
					$timeout(function() {
						scope.al_discount = (scope.vl_discount*100)/self.budget.order_value;
					});
				}

				this.confirm = function() {
					if (scope.al_discount < 0) return;
					
					authorizationDialog('Orçamento', { title: 'Autorização de desconto geral' }, 'order', 'user_discount').then(function(success) {
						if (success.user_max_discount >= scope.al_discount) {
							authorizedBy = success;

							scope._close({
								al_discount: scope.al_discount, 
								vl_discount: scope.vl_discount
							});
						} else {
							$rootScope.customDialog().showMessage('Erro', 'Não autorizado!');
						}
					}, function(error) {
						deferred.reject(error);
					});
				}
			};

			$rootScope.customDialog().showTemplate('Orçamento', './partials/modalDiscount.html', controller, { width: 240, zIndex: 1, escapeToClose: true })
				.then(function(success) {
					var total = self.budget.order_value_total;

					angular.forEach( self.budget.order_items, function(item, index){
						item.setAlDiscount(success.al_discount);
					});

					self.budget.order_audit_discounts.push({
						title: 'Desconto geral',
						al_discount: success.al_discount,
						vl_discount: success.vl_discount,
						user_id: authorizedBy.user_id,
						user_name: authorizedBy.user_name,
						person_name: self.budget.order_client && self.budget.order_client.person_name,
						person_code: self.budget.order_client && self.budget.order_client.person_code,
						date: moment().tz('America/Sao_Paulo').toDate()
					});
					
					self.budget.updateValues();
					self.recalcPayments();
				}, function(error) { });
		}

		/**
		 * Faz a ancora para a seção.
		 */
		function goToSection(section,focus) {
			self.scrollTo('section[name="'+section+'"]');
			self.focusOn('input[name="'+focus+'"]');
		}

		/*
		 * Exibe o modal de informacao do vendedor.
		 */
		function showModalOrderSeller(callback) {
			var options = {
					hasBackdrop: true,
					escapeToClose: false,
					clickOutsideToClose: false,
					focusOnOpen: false,
					zIndex: 1,
					width: 500
				},
				controller = function(scope) {
					var vm = this;

					$timeout(function(){
						jQuery('input[name="seller-code"]').focus();
					},100);

					this._showCloseButton = true;

					this.budget = self.budget;
					this.tempSeller = self.internal.tempSeller;

					this.getSellerByName = function(name) {
						return getPersonByName(name, Globals.get('person-categories').seller);
					};

					this.getSellerByCode = function(code) {
						if (!code) {
							self.focusOn('input[name="autocompleteSeller"]');
							return;
						}

						if (code == self.budget.order_seller.person_code) {
							self.focusOn('.footer button[name="confirm"]');
							return;
						}

						if (!parseInt(code))
							return;

						$rootScope.loading.load();
						getPersonByCode(code, Globals.get('person-categories').seller).then(function(success) {
							self.budget.setSeller(new Person(success.data));
							vm.tempSeller = new Person(success.data);
							self.internal.tempSeller = vm.tempSeller;
							$rootScope.loading.unload();
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();

							if (error.status == 404) {
								self.showNotFound();
							}
						});
					};
					
					this.blurSeller = function() { 
						if (vm.budget.order_seller.person_id) 
							vm.tempSeller = new Person(vm.budget.order_seller);
					};

					this.showModalSeller = function() {
						var category = Globals.get('person-categories').seller,
							options = {
								module: 'Representante',
								limit: 100
							};

						showModalPerson('Localizar Vendedor', category, options)
							.then(function(success) {
								vm.budget.setSeller(new Person(success));
								vm.tempSeller = new Person(success);
								self.internal.tempSeller = new Person(success);
							}, function(error) { });
					};
				};

				controller.$inject = [ '$scope' ];

			self.internal.flags.isToolbarLocked = true;
			$rootScope.customDialog().showTemplate('Orçamento', './partials/modalOrderSeller.html', controller, options)
				.then(function(success) {
					self.internal.flags.isToolbarLocked = false;
					callback && callback();
				}, function(error) {
					self.internal.flags.isToolbarLocked = false;
					callback && callback();
				});
		}

		/*
		 * Exibe o modal de desbloqueio de edicao.
		 */
		function showLockModal() {
			if (self.budget.order_status_id == Globals.get('order-status-values').billed || self.budget.status.editable == 'N') {
				self.internal.flags.printable = true;
				self.internal.flags.showInfo = true;

				if (self.budget.status.message) {
					$rootScope.customDialog().showMessage('Aviso', self.budget.status.message);
				}
				return;
			}

			if (self.budget.order_status_id == Globals.get('order-status-values').open) {
				$scope.isDisabled = false;
				self.internal.flags.showInfo = true;
				return;
			}

			var options = {
				zIndex: 1,
				escapeToClose: false,
				clickOutsideToClose: false,
				width: 500,
				hasBackdrop: true
			};

			function ctrl() {
				this._showCloseButton = false;
				this.confirm = function() {
					var msg, scope = this;

					msg = 'Ao recuperar este orçamento seu pedido deixará de existir. O mesmo poderá ser reexportado futuramente.<br><br>Deseja continuar?'

					$rootScope.customDialog().showConfirm('Recuperação de orçamento', msg)
						.then(function(success) {
							scope._close();
						});
				};
			}

			$rootScope.customDialog().showTemplate('Aviso', './partials/modalUnlockOrder.html', ctrl, options)
				.then(function(success) {
					$rootScope.loading.load();
					providerOrder.unlock(self.budget.order_id)
						.then(function(success) {
							$rootScope.loading.unload();
							if (constants.isElectron) {
								var options = {
									parent: _remote.getGlobal('mainWindow').instance,
									webPreferences: {
										zoomFactor: 1
									}
								};

								ElectronWindow.createWindow('#/order/edit/' + self.budget.order_code, options);
							}
							else {
								$location.path('/order/edit/' + self.budget.order_code).search('source', 'recover');
							}
							$timeout(function() {
								window.close();
							}, 1000);
							self.propagateSaveOrder(self.budget.order_company_id);
						}, function(error) {
							constants.debug && console.log(error);
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
				}, function(error) { 
					self.internal.flags.printable = true;
					self.internal.flags.showInfo = true;
				}); 
		}
	}
})();