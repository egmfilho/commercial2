/*
* @Author: egmfilho
* @Date:   2017-06-23 17:13:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-31 10:02:29
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
				
				$rootScope.openOrderFilters.seller = new Person(Globals.get('user')['user_seller']);;
				$rootScope.openOrderFilters.companyId = Globals.get('user').user_company[0].company_id;
				
				$rootScope.openOrderFilters.calendars = {};
				$rootScope.openOrderFilters.calendars.start = {
					isCalendarOpen: false,
					value: moment().tz('America/Sao_Paulo').toDate(),
					maxDate: moment().tz('America/Sao_Paulo').toDate(),
					update: function(){
						$rootScope.openOrderFilters.calendars.end.value = moment($rootScope.openOrderFilters.calendars.start.value).toDate();
						$rootScope.openOrderFilters.calendars.end.minDate = moment($rootScope.openOrderFilters.calendars.start.value).toDate();
						$rootScope.openOrderFilters.calendars.end.maxDate = moment($rootScope.openOrderFilters.calendars.start.value).add(dateRange,'days').toDate();
					}
				};
	
				$rootScope.openOrderFilters.calendars.end = {
					isCalendarOpen: false,
					value: moment().tz('America/Sao_Paulo').toDate(),
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

			$scope.globals = Globals.get;

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
					ElectronWindow.createWindow('#/order/clone/' + order.order_code, options);
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
			}

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
						var temp = {
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

						return temp;
					});

					$rootScope.loading.unload();

				}, function(error) {
					constants.debug && console.log(error);
					$rootScope.loading.unload();
				});
			}

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

			self.getSellerByName = function(name) {
				return getPersonByName(name, Globals.get('person-categories').seller);
			};

			self.getSellerByCode = function(code) {
				if (!code) {
					self.focusOn('input[name="autocompleteSeller"]');
					return;
				}

				if ( ( $rootScope.openOrderFilters.seller && code == $rootScope.openOrderFilters.seller.person_code ) || !parseInt(code))
					return;

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

			self.getPersonByCode = function(code, category, options) {
				if (!code) return;

				return providerPerson.getByCode(code, category, options);
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

		}

})();