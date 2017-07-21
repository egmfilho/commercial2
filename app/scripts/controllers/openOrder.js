/*
* @Author: egmfilho
* @Date:   2017-06-23 17:13:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 11:31:19
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('OpenOrderCtrl', OpenOrderCtrl);

		OpenOrderCtrl.$inject = [ '$rootScope', '$scope', '$location', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronWindow' ];

		function OpenOrderCtrl($rootScope, $scope, $location, providerOrder, Order, Globals, constants, ElectronWindow) {

			var self = this;

			self.filter = '';

			$scope.globals = Globals.get;

			$scope.$on('$viewContentLoaded', function() {
				self.getOrders();
			});

			$scope.open = function(code) {
				$location.path('/order/edit').search('code', code);
			};

			self.companies = Globals.get('user').user_company;

			self.calendar = {}
			self.calendar.start = {
				isCalendarOpen: false,
				value: moment().toDate(),
				update: function(){
					self.calendar.end.value = moment(self.calendar.start.value).toDate();
					self.options.start_date = self.calendar.start.value;
					self.options.end_date = self.calendar.end.value;
					self.calendar.end.minDate = moment(self.calendar.start.value).toDate();
					self.calendar.end.maxDate = moment(self.calendar.start.value).add(7,'days').toDate();
				}
			};
			self.calendar.end = {
				isCalendarOpen: false,
				value: moment().toDate(),
				minDate: moment(self.calendar.start.value).toDate(),
				maxDate: moment(self.calendar.start.value).add(7,'days').toDate(),
				update: function(){
					self.options.end_date = self.calendar.end.value;
				}
			};

			self.grid = {
				propertyName: 'order_code',
				reverse: true
			}

			self.sortBy = function(propertyName) {
				self.grid.reverse = (self.grid.propertyName === propertyName) ? !self.grid.reverse : false;
				self.grid.propertyName = propertyName;
			};

			self.options = {
				company_id: Globals.get('user').user_company[0].company_id,
				start_date: self.calendar.start.value,
				end_date: self.calendar.end.value,
				getCustomer: true,
				getSeller: true,
				limit: 30
			};

			self.getOrders = function(){
				
				self.orders = [];

				$rootScope.loading.load();
				providerOrder.getAll(self.options).then(function(success) {
					self.orders = success.data.map(function(order) {
						return new Order(order);
					});
					constants.debug && console.log(self.orders);
					$rootScope.loading.unload();

					if (!self.orders.length) {
						$rootScope.customDialog().showMessage('Aviso', 'Nenhum orçamento encontrado!');
					}
				}, function(error) {
					constants.debug && console.log(error);
					$rootScope.loading.unload();
				});
			}

			self.print = function(code) {
				if (constants.isElectron)
					ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + code + '?action=print');
				else
					$location.path('/order/print/'+code)
			}

			self.savePDF = function(code) {
				if (constants.isElectron)
					ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + code + '?action=pdf');
				else
					$location.path('/order/print/'+code)
			}

		}

}());