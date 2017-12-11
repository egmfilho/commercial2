/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-23 17:13:32
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-11 13:08:33
 */

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('OpenOrderCtrl', OpenOrderCtrl);

		OpenOrderCtrl.$inject = [ '$rootScope', '$scope', '$routeParams', '$location', '$q', '$timeout', '$filter', 'ProviderOrder', 'Order', 'ProviderPerson', 'Person', 'WebWorker', 'Globals', 'Constants', 'ElectronWindow', 'OpenedOrderManager' ];

		function OpenOrderCtrl($rootScope, $scope, $routeParams, $location, $q, $timeout, $filter, providerOrder, Order, providerPerson, Person, WebWorker, Globals, constants, ElectronWindow, OpenedOrderManager) {

			var self = this,
				Mousetrap = null,
				dateRange = 31;

			if (!$rootScope.openOrderFilters) {
				$rootScope.openOrderFilters = { };

				$rootScope.openOrderFilters.grid = {
					propertyName: 'order_code',
					reverse: true
				};
				
				if (Globals.get('user')['user_seller'].person_id)
					$rootScope.openOrderFilters.seller = new Person(Globals.get('user')['user_seller']);
				$rootScope.openOrderFilters.companyId = Globals.get('user').user_company[0].company_id;
				$rootScope.openOrderFilters.customer = null;
				$rootScope.openOrderFilters.products = [];
				$rootScope.openOrderFilters.minValue = 0;
				$rootScope.openOrderFilters.maxValue = null;
				
				$rootScope.openOrderFilters.calendars = {};
				$rootScope.openOrderFilters.calendars.start = {
					isCalendarOpen: false,
					value: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
					maxDate: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
					update: function(){
						$rootScope.openOrderFilters.calendars.end.value = moment($rootScope.openOrderFilters.calendars.start.value).toDate();
						$rootScope.openOrderFilters.calendars.end.minDate = moment($rootScope.openOrderFilters.calendars.start.value).toDate();
						$rootScope.openOrderFilters.calendars.end.maxDate = moment($rootScope.openOrderFilters.calendars.start.value).add(dateRange,'days').toDate();
					}
				};
	
				$rootScope.openOrderFilters.calendars.end = {
					isCalendarOpen: false,
					value: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
					minDate: moment($rootScope.openOrderFilters.calendars.start.value).toDate(),
					maxDate: moment($rootScope.openOrderFilters.calendars.start.value).add(dateRange,'days').toDate()
				};

				$rootScope.openOrderFilters.filters = {
					query: '',
					types: [],
					children: [],
					toggleStatus: function(exportType, status, child) {
						var statype = status.toString() + exportType;
	
						// Statipo
						if ($rootScope.openOrderFilters.filters.types.indexOf(statype) < 0)
							$rootScope.openOrderFilters.filters.types.push(statype);
						else
							$rootScope.openOrderFilters.filters.types.splice($rootScope.openOrderFilters.filters.types.indexOf(statype), 1);
	
						// Elemento
						if ($rootScope.openOrderFilters.filters.children.indexOf(child) < 0)
							$rootScope.openOrderFilters.filters.children.push(child);
						else
							$rootScope.openOrderFilters.filters.children.splice($rootScope.openOrderFilters.filters.children.indexOf(child), 1);
					},
					cerol: function(order) {
						if (!$rootScope.openOrderFilters.filters.types.length) 
							return true;
	
						return $rootScope.openOrderFilters.filters.types.indexOf(order.order_statype) >= 0;
					}
				};
			}	
			self.orderStatusValues = Globals.get('order-status-values');
			self.orderExportTypeColors = Globals.get('order-export-type-colors');

			if (constants.isElectron) {
				Mousetrap = require('mousetrap');
				
				/* Novo orcamento */
				Mousetrap.bind(['command+n', 'ctrl+n'], function() {
					$scope.newOrder();
					return false;
				});

				/* Find */
				Mousetrap.bind(['command+f', 'ctrl+f'], function() {
					$timeout(function() { $scope.setSearchOpen(true); });
					return false;
				});
			}

			$scope.info = {
				count: 0,
				sum: 0
			};

			$scope.$on('$viewContentLoaded', function() {
				$rootScope.titleBarText = 'Abrir Orçamento';

				// if ($routeParams.company)
					// $rootScope.openOrderFilters.companyId = $routeParams.company;

				// if ($routeParams.start)
				// 	self.calendar.start.value = $routeParams.company;

				// if (Globals.get('user')['user_seller'].person_id) {
					// $rootScope.openOrderFilters.seller = new Person(Globals.get('user')['user_seller']);
				// }
				
				$timeout(function() {
					$rootScope.loading.load(null, null, { zIndex: 1 });
					self.getOrders();
					$rootScope.loading.unload();
				}, 1000);
			});

			$scope.$on('$destroy', function() {
				$rootScope.titleBarText = '';
				
				if (constants.isElectron) {
					Mousetrap.unbind(['command+n', 'ctrl+n']);
					Mousetrap.unbind(['command+f', 'ctrl+f']);
				}
			});

			$scope.newOrder = function() {
				var options = {
					// title: 'Novo orçamento'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/new/' + $rootScope.openOrderFilters.companyId, options);
				else
					$location.path('/order/new/' + $rootScope.openOrderFilters.companyId);
			};

			$scope.open = function(order) {
				if (OpenedOrderManager.isOpen(order.order_code)) {
					$rootScope.customDialog().showMessage('Erro', 'Este orçamento encontra-se aberto no momento.');
					return;
				}

				var options = {
					// title: 'Cód: ' + order.order_code + ' (' + $filter('date')(order.order_date, 'short') + ')'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/edit/' + order.order_code, options);
				else
					$location.path('/order/edit/' + order.order_code);
			};

			$scope.clone = function(order) {
				if (OpenedOrderManager.isOpen(order.order_code)) {
					$rootScope.customDialog().showMessage('Erro', 'Este orçamento encontra-se aberto no momento.');
					return;
				}

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/clone/' + order.order_code);
				else
					$location.path('/order/clone/' + order.order_code);
			};

			$scope.delete = function(order) {
				if (OpenedOrderManager.isOpen(order.order_code)) {
					$rootScope.customDialog().showMessage('Erro', 'Este orçamento encontra-se aberto no momento.');
					return;
				}

				$rootScope.customDialog().showConfirm('Aviso', 'Excluir o orçamento <b>' + order.order_code + '</b>?')
					.then(function(success) {
						$rootScope.loading.load(null, null, { zIndex: 1 });
						providerOrder.remove(order.order_id).then(function(success) {
							$rootScope.loading.unload();
							// $rootScope.customDialog().showMessage('Sucesso', 'Orçamento excluído!');
							self.getOrders();
						}, function(error) { 
							$rootScope.loading.unload();
							$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						});
					}, function(error) { });
			};

			$scope.setSearchOpen = function(value) {
				$scope.isSearchOpened = value;

				if (value) {
					jQuery('.search-container .search input').focus().select();
				} else {
					jQuery('.search-container .search input').blur();
					$rootScope.openOrderFilters.filters.query = '';
				}
			};

			self.companies = Globals.get('user').user_company;

			self.sortBy = function(propertyName) {
				$rootScope.openOrderFilters.grid.reverse = ($rootScope.openOrderFilters.grid.propertyName === propertyName) ? !$rootScope.openOrderFilters.grid.reverse : false;
				$rootScope.openOrderFilters.grid.propertyName = propertyName;
			};

			self.getOrders = function (index, quantity){
				self.orders = [];

				var options = {
						company_id: $rootScope.openOrderFilters.companyId,
						start_date: $rootScope.openOrderFilters.calendars.start.value,
						end_date: $rootScope.openOrderFilters.calendars.end.value,
						order_seller_id: $rootScope.openOrderFilters.seller && $rootScope.openOrderFilters.seller.person_id,
						order_client_id: $rootScope.openOrderFilters.customer && $rootScope.openOrderFilters.customer.person_id,
						product_id: $rootScope.openOrderFilters.products.map(function(p) { return p.product_id }),
						order_min_value: $rootScope.openOrderFilters.minValue,
						order_max_value: $rootScope.openOrderFilters.maxValue,
						getCustomer: true,
						getSeller: true
					};

				$rootScope.loading.load(null, null, { zIndex: 1 });
				providerOrder.getAll(options).then(function(success) {
					$scope.info.count = success.info.quantity;
					$scope.info.sum = success.info.value_total;
					
					$scope.setSearchOpen(false);
					$rootScope.openOrderFilters.filters.query = '';

					var orderExportTypeColors = Globals.get('order-export-type-colors'),
						orderStatusValues = Globals.get('order-status-values');

					self.orders = success.data.map(function(order) {
						var orderOrigin = Globals.get('order-origin-id'),
							icons = { }, origins = { };
						
						icons[orderOrigin.desktop] = 'computer';
						icons[orderOrigin.smartphone] = 'phone_iphone';

						origins[orderOrigin.desktop] = 'computador';
						origins[orderOrigin.smartphone] = 'celular';
						
						var temp = {
							order_origin: 'Origem: ' + origins[order.order_origin_id],
							order_icon: icons[order.order_origin_id],
							order_id: order.order_id,
							order_code: order.order_code,
							order_code_erp: order.order_code_erp_list,
							order_status_id: order.order_status_id,
							order_export_type: order.order_export_type_list,
							order_statype: order.order_status_id.toString() + order.order_export_type_list,
							order_value_total: order.order_value_total,
							order_value_st: order.order_value_st,
							order_value_total_plus_st_formatted: $filter('currency')(order.order_value_total + order.order_value_st, 'R$ '),
							order_value_total_plus_st: order.order_value_total + order.order_value_st,
							order_date_formatted: $filter('date')(new Date(order.order_date), 'dd/MM/yyyy HH:mm'),
							order_date: new Date(order.order_date),
							order_update_formatted: order.order_update && $filter('date')(new Date(order.order_update), 'dd/MM/yyyy HH:mm'),
							order_update: new Date(order.order_update),
							order_customer_name: order.order_client.person_name,
							order_seller_name: order.order_seller.person_shortname ? order.order_seller.person_shortname : $filter('truncate')(order.order_seller.person_name, 15, ' '),
							cloudColor: orderExportTypeColors[order.order_export_type_list],
							isOpen: order.order_status_id == orderStatusValues.open,
							isExported: order.order_status_id == orderStatusValues.exported,
							isBilled: order.order_status_id == orderStatusValues.billed,							
						};

						temp.queryable = '';
						temp.queryable += temp.order_code + ' '; 
						temp.queryable += temp.order_code_erp + ' ';
						temp.queryable += temp.order_value_total_plus_st_formatted + ' ';
						temp.queryable += temp.order_date_formatted + ' ';
						temp.queryable += temp.order_customer_name + ' ';
						temp.queryable += '@cliente:' + order.order_client.person_code + ' ';
						temp.queryable += '@cliente:' + order.order_client.person_name + ' ';
						temp.queryable += '@vendedor:' + (order.order_seller.person_shortname ? order.order_seller.person_shortname : order.order_seller.person_name) + ' ',
						temp.queryable += '@vendedor:' + order.order_seller.person_code + ' ';
						temp.queryable += '@origem:' + origins[order.order_origin_id] + ' ';

						return temp;
					});

					$rootScope.loading.unload();

				}, function(error) {
					constants.debug && console.log(error);
					$rootScope.loading.unload();

					if (error.status == 404) {
						$rootScope.customDialog().showMessage('Erro', 'Nenhum resultado, por favor verifique os filtros!');
					} else {
						$rootScope.customDialog().showMessage('Erro', error.data.status.description);
					}
				});
			};

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

			self.getPersonByCode = function(code, category, options) {
				if (!code) return;

				return providerPerson.getByCode(code, category, options);
			};

			self.getSellerByName = function(name) {
				return getPersonByName(name, Globals.get('person-categories').seller);
			};

			self.getSellerByCode = function(code) {
				if (!code) {
					self.focusOn('input[name="autocompleteSeller"]');
					return;
				}

				if (!parseInt(code)) return;

				if ($rootScope.openOrderFilters.seller && code == $rootScope.openOrderFilters.seller.person_code ) {
					self.getOrders();
					return;
				}

				$rootScope.loading.load(null, null, { zIndex: 1 });
				self.getPersonByCode(code, Globals.get('person-categories').seller).then(function(success) {
					$rootScope.openOrderFilters.seller = new Person(success.data);
					$rootScope.loading.unload();
				}, function(error){
					constants.debug && console.log(error);
					$rootScope.loading.unload();

					if (error.status == 404)
						self.showNotFound();
				});
			};

			self.print = function(code, isCupon, isPDF) {
				var options = {
					webPreferences: {
						zoomFactor: 1
					}
				}, root, type, url;

				root = isCupon ? '/cupon/' : '/print/';
				type = isPDF ? '/pdf' : '';
				url = root + code + type;

				if (constants.isElectron)
					ElectronWindow.createWindow('#' + url, options);
				else
					$location.path(url);
			};

			self.printTicket = function(code) {
				var options = {
					webPreferences: {
						zoomFactor: 1
					}
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/ticket/' + code, options);
				else
					$location.path('/ticket/' + code);
			};

			self.mail = function(code) {
				var options = {
					webPreferences: {
						zoomFactor: 1
					}
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/mail/' + code, options);
				else
					$location.path('/mail/' + code);
			};

			self.getSum = function(list) {
				if (!list) return 0;

				var sum = 0;

				for(var i = 0; i < list.length; i++) {
					sum += list[i].order_value_total + list[i].order_value_st;
				}

				return sum;
			};

			self.sync = function() {
				var options = {
					company_id: $rootScope.openOrderFilters.companyId,
					start_date: $rootScope.openOrderFilters.calendars.start.value,
					end_date: $rootScope.openOrderFilters.calendars.end.value,
					order_seller_id: $rootScope.openOrderFilters.seller && $rootScope.openOrderFilters.seller.person_id,
					getCustomer: true,
					getSeller: true
				};

				$rootScope.loading.load();
				providerOrder.sync(options).then(function(success) {
					self.getOrders();
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.loading.unload();
					$rootScope.customDialog().showMessage('Erro', error.data.status.description);
				});
			}

			self.singleSync = function( order_id ) {
				var options = {
					order_id: order_id
				};

				$rootScope.loading.load();
				providerOrder.singleSync(options).then(function(success) {
					self.getOrders();
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.loading.unload();
					$rootScope.customDialog().showMessage('Erro', error.data.status.description);
				});
			}

			self.removeExtraFilters = function() {
				$rootScope.openOrderFilters.customer = null;
				$rootScope.openOrderFilters.products = [ ];
				$rootScope.openOrderFilters.minValue = 0;
				$rootScope.openOrderFilters.maxValue = null;
				
				$rootScope.customDialog().showMessage('Aviso', 'Alguns filtros foram removidos!');
			};

			self.showFilters = function() {
				var options = {
					width: 600,
					hasBackdrop: true,
					zIndex: 4
				};

				var controller = function(ModalProduct) {
					var scope = this;
					this._showCloseButton = true;

					this.companies = self.companies;

					this.companyId = $rootScope.openOrderFilters.companyId;
					this.seller = $rootScope.openOrderFilters.seller ? new Person($rootScope.openOrderFilters.seller) : null;
					this.calendars = { };
					this.calendars.start = Object.assign({}, $rootScope.openOrderFilters.calendars.start, {
						update: function(){
							scope.calendars.end.value = moment(scope.calendars.start.value).toDate();
							scope.calendars.end.minDate = moment(scope.calendars.start.value).toDate();
							scope.calendars.end.maxDate = moment(scope.calendars.start.value).add(dateRange,'days').toDate();
						}
					});
					this.calendars.end = Object.assign({}, $rootScope.openOrderFilters.calendars.end);
					this.customer = $rootScope.openOrderFilters.customer ? new Person($rootScope.openOrderFilters.customer) : null;
					this.products = $rootScope.openOrderFilters.products;
					this.minValue = $rootScope.openOrderFilters.minValue;
					this.maxValue = $rootScope.openOrderFilters.maxValue;

					this.getSellerByName = self.getSellerByName;

					this.getSellerByCode = function(code) {
						if (!code) {
							self.focusOn('input[name="autocompleteSellerModal"]');
							return;
						}
		
						if (!parseInt(code)) return;
		
						$rootScope.loading.load(null, null, { zIndex: 1 });
						self.getPersonByCode(code, Globals.get('person-categories').customer).then(function(success) {
							scope.seller = new Person(success.data);
							$rootScope.loading.unload();
						}, function(error){
							constants.debug && console.log(error);
							$rootScope.loading.unload();
		
							if (error.status == 404)
								self.showNotFound();
						});
					};

					this.getCustomerByName = function(name) {
						return getPersonByName(name, Globals.get('person-categories').customer);
					};
		
					this.getCustomerByCode = function(code) {
						if (!code) {
							self.focusOn('input[name="autocompleteCustomerModal"]');
							return;
						}
		
						if (!parseInt(code)) return;
		
						$rootScope.loading.load(null, null, { zIndex: 1 });
						self.getPersonByCode(code, Globals.get('person-categories').customer).then(function(success) {
							scope.customer = new Person(success.data);
							$rootScope.loading.unload();
						}, function(error){
							constants.debug && console.log(error);
							$rootScope.loading.unload();
		
							if (error.status == 404)
								self.showNotFound();
						});
					};

					this.showModalProducts = function() {
						var options = {
							getUnit: 1,
							getPrice: 1,
							getStock: 1,
							limit: 200,
							width: 800,
							innerDialog: false,
							zIndex: 5,
							multiSelection: false
						};

						ModalProduct.show('Localizar Produto', scope.companyId, null, options)
							.then(function(success) {
								var products = success.reduce(function(array, item) {
									var index = scope.products.findIndex(function(p) {
										return p.product_id === item.product.product_id;
									});
									// adiciona apenas se nao existir no array
									if (index == -1)
										array.push(item.product);
										
									return array;
								}, [ ]);
								console.log(products);
								$timeout(function() { scope.products = scope.products.concat(products) });
							});
					};

					this.close = function() {
						scope._close({
							companyId: scope.companyId,
							seller: scope.seller,
							calendars: scope.calendars,
							customer: scope.customer,
							products: scope.products,
							minValue: scope.minValue,
							maxValue: scope.maxValue
						});
					};
				};

				controller.$inject = [ 'ModalProduct' ];

				$rootScope.customDialog().showTemplate('Commercial', './partials/modalOrderFilters.html', controller, options)
					.then(function(success) {
						$rootScope.openOrderFilters.companyId = success.companyId;
						$rootScope.openOrderFilters.seller = success.seller ? new Person(success.seller) : null;
						$rootScope.openOrderFilters.calendars.start = Object.assign({ }, success.calendars.start, {
							update: $rootScope.openOrderFilters.calendars.start.update
						});
						$rootScope.openOrderFilters.calendars.end = Object.assign({ }, success.calendars.end);
						$rootScope.openOrderFilters.customer = success.customer ? new Person(success.customer) : null;
						$rootScope.openOrderFilters.products = success.products;
						$rootScope.openOrderFilters.minValue = success.minValue;
						$rootScope.openOrderFilters.maxValue = success.maxValue;

						self.getOrders();
					}, function(error) {
						if (error && error.reset) {
							if (Globals.get('user')['user_seller'].person_id)
								$rootScope.openOrderFilters.seller = new Person(Globals.get('user')['user_seller']);
							else 
								$rootScope.openOrderFilters.seller = null;

							$rootScope.openOrderFilters.companyId = Globals.get('user').user_company[0].company_id;
							$rootScope.openOrderFilters.calendars.start.value = moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate();
							$rootScope.openOrderFilters.calendars.end.value = moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate();
							self.removeExtraFilters();

							self.getOrders();
						}
					});
			};

		}

})();