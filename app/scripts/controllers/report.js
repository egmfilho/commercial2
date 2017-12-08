/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-12-08 16:10:38 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-08 17:36:43
 */

'use strict';

angular.module('commercial2.controllers')
	.controller('ReportCtrl', ['$rootScope', '$scope', '$filter', 'ProviderOrder', 'Order', 'Person', 'Globals', function($rootScope, $scope, $filter, providerOrder, Order, Person, Globals) {
		
		var self = this, dateRange = 31;

		self.orders = [ ];
		
		$scope.info = {
			count: 0,
			sum: 0
		};

		self.filters = { };

		$scope.$on('$viewContentLoaded', function() {
			self.filters.grid = {
				propertyName: 'order_code',
				reverse: true
			};
			self.filters.seller = new Person(Globals.get('user')['user_seller'].person_id ? Globals.get('user')['user_seller'] : null);
			self.filters.companyId = Globals.get('user').user_company[0].company_id;
			self.filters.calendars = { };
			self.filters.calendars.start = {
				isOpen: false,
				value: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
				maxDate: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
				update: function(){
					self.filters.calendars.end.value = moment(self.filters.calendars.start.value).toDate();
					self.filters.calendars.end.minDate = moment(self.filters.calendars.start.value).toDate();
					self.filters.calendars.end.maxDate = moment(self.filters.calendars.start.value).add(dateRange,'days').toDate();
				}
			};
			self.filters.calendars.end = {
				isOpen: false,
				value: moment().tz('America/Sao_Paulo').set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toDate(),
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

	}]);