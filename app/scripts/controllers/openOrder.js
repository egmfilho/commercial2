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

			self.seller = null;
			self.companyId = Globals.get('user').user_company[0].company_id;
			self.orderStatusValues = Globals.get('order-status-values');
			self.orderExportTypeColors = Globals.get('order-export-type-colors');

			self.filters = {
				query: '',
				status: '',
				exportType: '',
				setStatus: function(exportType, status, child) {
					jQuery('.filters .status-filter').removeClass('active');

					if (status == self.filters.status && exportType == self.filters.exportType) {
						self.filters.status = '';
						self.filters.exportType = '';
					} else {
						self.filters.status = status;
						self.filters.exportType = exportType;
						jQuery('.filters .status-filter:nth-child(' + child + ')').addClass('active');
					}
				}
			}

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

				if ($routeParams.company)
					self.companyId = $routeParams.company;

				// if ($routeParams.start)
				// 	self.calendar.start.value = $routeParams.company;

				if (Globals.get('user')['user_seller'].person_id) {
					self.seller = new Person(Globals.get('user')['user_seller']);
				}
				
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

			$scope.newOrder = function(companyId) {
				var options = {
					// title: 'Novo orçamento'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/new?company=' + companyId, options);
				else
					$location.path('/order/new').search('company', companyId);
			}

			$scope.open = function(order) {
				if (OpenedOrderManager.isOpen(order.order_code)) {
					$rootScope.customDialog().showMessage('Erro', 'Este orçamento encontra-se aberto.');
					return;
				}

				var options = {
					// title: 'Cód: ' + order.order_code + ' (' + $filter('date')(order.order_date, 'short') + ')'
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/edit?code=' + order.order_code, options);
				else
					$location.path('/order/edit').search('code', order.order_code);
			};

			$scope.delete = function(order) {
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
					self.filters.query = '';
				}
			};

			self.companies = Globals.get('user').user_company;

			if (!$rootScope.openOrderCalendar) {
				$rootScope.openOrderCalendar = {};
				$rootScope.openOrderCalendar.start = {
					isCalendarOpen: false,
					value: moment().toDate(),
					maxDate: moment().toDate(),
					update: function(){
						$rootScope.openOrderCalendar.end.value = moment($rootScope.openOrderCalendar.start.value).toDate();
						$rootScope.openOrderCalendar.end.minDate = moment($rootScope.openOrderCalendar.start.value).toDate();
						$rootScope.openOrderCalendar.end.maxDate = moment($rootScope.openOrderCalendar.start.value).add(dateRange,'days').toDate();
					}
				};
	
				$rootScope.openOrderCalendar.end = {
					isCalendarOpen: false,
					value: moment().toDate(),
					minDate: moment($rootScope.openOrderCalendar.start.value).toDate(),
					maxDate: moment($rootScope.openOrderCalendar.start.value).add(dateRange,'days').toDate()
				};
			}

			self.grid = {
				propertyName: 'order_code',
				reverse: true
			};

			self.sortBy = function(propertyName) {
				self.grid.reverse = (self.grid.propertyName === propertyName) ? !self.grid.reverse : false;
				self.grid.propertyName = propertyName;
			};

			self.getOrders = function (index, quantity){
				self.orders = [];

				var options = {
						// start_date: moment('08-01-2017').toDate(),
						// end_date: moment('08-31-2017').toDate(),
						company_id: self.companyId,
						start_date: $rootScope.openOrderCalendar.start.value,
						end_date: $rootScope.openOrderCalendar.end.value,
						order_seller_id: self.seller && self.seller.person_id,
						getCustomer: true,
						getSeller: true
					};

				$rootScope.loading.load(null, null, { zIndex: 1 });
				providerOrder.getAll(options).then(function(success) {
					$scope.info.count = success.info.quantity;
					$scope.info.sum = success.info.value_total;

					$scope.setSearchOpen(false);
					self.filters.query = '';

					var orderExportTypeColors = Globals.get('order-export-type-colors'),
						orderStatusValues = Globals.get('order-status-values');

					self.orders = success.data.map(function(order) {
						var temp = {
							order_code: order.order_code,
							order_code_erp: order.order_code_erp_list,
							order_status_id: order.order_status_id,
							order_export_type: order.order_export_type_list,
							order_value_total: order.order_value_total,
							order_value_st: order.order_value_st,
							order_value_total_plus_st_formatted: $filter('currency')(order.order_value_total + order.order_value_st, 'R$ '),
							order_date_formatted: $filter('date')(new Date(order.order_date), 'dd/MM/yyyy HH:mm'),
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

				if ( ( self.seller && code == self.seller.person_code ) || !parseInt(code))
					return;

				$rootScope.loading.load(null, null, { zIndex: 1 });
				self.getPersonByCode(code, Globals.get('person-categories').seller).then(function(success) {
					self.seller = new Person(success.data);
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

			self.print = function(code) {
				var options = {
					webPreferences: {
						zoomFactor: 1
					}
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/print/' + code + '?action=print', options);
				else
					$location.path('/order/print/'+code)
			};

			self.mail = function(code) {
				var options = {
					webPreferences: {
						zoomFactor: 1
					}
				};

				if (constants.isElectron)
					ElectronWindow.createWindow('#/order/mail/' + code, options);
				else
					$location.path('/order/mail/' + code);
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