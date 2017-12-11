/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-12-08 16:10:38 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-11 09:10:48
 */

'use strict';

angular.module('commercial2.controllers')
	.controller('ReportCtrl', ['$rootScope', '$scope', '$filter', '$q', 'ProviderOrder', 'Order', 'ProviderPerson', 'Person', 'Globals', 'Constants', function($rootScope, $scope, $filter, $q, providerOrder, Order, providerPerson, Person, Globals, constants) {
		
		var self = this, dateRange = 31;

		self.companies = Globals.get('user').user_company;
		self.orders = [ ];
		
		$scope.info = {
			count: 0,
			sum: 0
		};

		self.filters = { };
		self.orderStatusValues = Globals.get('order-status-values');
		self.orderExportTypeColors = Globals.get('order-export-type-colors');

		$scope.$on('$viewContentLoaded', function() {
			var today = new Date();
			self.filters.grid = {
				propertyName: 'order_code',
				reverse: true
			};
			self.filters.seller = new Person(Globals.get('user')['user_seller'].person_id ? Globals.get('user')['user_seller'] : null);
			self.filters.customer = null;
			self.filters.companyId = Globals.get('user').user_company[0].company_id;
			self.filters.calendars = { };
			self.filters.calendars.start = {
				isOpen: false,
				value: moment(new Date(today.getFullYear(), today.getMonth(), 1)).tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
				maxDate: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
				update: function() {
					self.filters.calendars.end.value = moment(self.filters.calendars.start.value).toDate();
					self.filters.calendars.end.minDate = moment(self.filters.calendars.start.value).toDate();
					self.filters.calendars.end.maxDate = moment(self.filters.calendars.start.value).add(dateRange,'days').toDate();
				}
			};
			self.filters.calendars.end = {
				isOpen: false,
				value: moment(new Date(today.getFullYear(), today.getMonth() + 1, 0)).tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
				minDate: moment(self.filters.calendars.start.value).toDate(),
				maxDate: moment(self.filters.calendars.start.value).add(dateRange,'days').toDate()
			};

			self.getOrders();
		});

		self.getOrders = function (){
			self.orders = [];

			var options = {
					company_id: self.filters.companyId,
					start_date: self.filters.calendars.start.value,
					end_date: self.filters.calendars.end.value,
					order_seller_id: self.filters.seller && self.filters.seller.person_id,
					order_client_id: self.filters.customer && self.filters.customer.person_id,
					getCustomer: true,
					getSeller: true
				};

			$rootScope.loading.load(null, null, { zIndex: 1 });
			providerOrder.getAll(options).then(function(success) {
				$scope.info.count = success.info.quantity;
				$scope.info.sum = success.info.value_total;

				var orderExportTypeColors = Globals.get('order-export-type-colors'),
					orderStatusValues = Globals.get('order-status-values');

				self.orders = success.data.map(function(order) {
					var orderOrigin = Globals.get('order-origin-id');
					
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
						isBilled: order.order_status_id == orderStatusValues.billed						
					};

					return temp;
				});

				$rootScope.loading.unload();

			}, function(error) {
				constants.debug && console.log(error);
				$rootScope.loading.unload();
			});
		};

		self.getPersonByCode = function(code, category, options) {
			if (!code) return;

			return providerPerson.getByCode(code, category, options);
		};

		self.sortBy = function(propertyName) {
			self.filters.grid.reverse = (self.filters.grid.propertyName === propertyName) ? !self.filters.grid.reverse : false;
			self.filters.grid.propertyName = propertyName;
		};

		self.getSum = function(list) {
			if (!list) return 0;

			var sum = 0;

			for(var i = 0; i < list.length; i++) {
				sum += list[i].order_value_total + list[i].order_value_st;
			}

			return sum;
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

		self.getSellerByName = function(name) {
			return getPersonByName(name, Globals.get('person-categories').seller);
		};

		self.getSellerByCode = function(code) {
			if (!code) {
				self.focusOn('input[name="autocompleteSeller"]');
				return;
			}

			if (!parseInt(code)) return;

			if (self.filters.seller && code == self.filters.seller.person_code ) {
				self.getOrders();
				return;
			}

			$rootScope.loading.load(null, null, { zIndex: 1 });
			self.getPersonByCode(code, Globals.get('person-categories').seller).then(function(success) {
				self.filters.seller = new Person(success.data);
				$rootScope.loading.unload();
			}, function(error){
				constants.debug && console.log(error);
				$rootScope.loading.unload();

				if (error.status == 404)
					self.showNotFound();
			});
		};

		self.getCustomerByName = function(name) {
			return getPersonByName(name, Globals.get('person-categories').customer);
		};

		self.getCustomerByCode = function(code) {
			if (!code) {
				self.focusOn('input[name="autocompleteCustomer"]');
				return;
			}

			if (!parseInt(code)) return;

			if (self.filters.customer && code == self.filters.customer.person_code ) {
				self.getOrders();
				return;
			}

			$rootScope.loading.load(null, null, { zIndex: 1 });
			self.getPersonByCode(code, Globals.get('person-categories').customer).then(function(success) {
				self.filters.customer = new Person(success.data);
				$rootScope.loading.unload();
			}, function(error){
				constants.debug && console.log(error);
				$rootScope.loading.unload();

				if (error.status == 404)
					self.showNotFound();
			});
		};

	}]);