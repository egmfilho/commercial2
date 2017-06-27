/*
* @Author: egmfilho
* @Date:   2017-06-23 17:13:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-27 13:02:30
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('OpenOrderCtrl', OpenOrderCtrl);

		OpenOrderCtrl.$inject = [ '$rootScope', '$scope', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronWindow' ];

		function OpenOrderCtrl($rootScope, $scope, providerOrder, Order, Globals, constants, ElectronWindow) {

			var self = this;

			$scope.globals = Globals.get;

			$scope.$on('$viewContentLoaded', function() {
				getOrders();
			});

			function getOrders() {
				var options = {
					getCustomer: true,
					getSeller: true,
					getCompany: true
				};

				self.orders = [];

				$rootScope.loading.load();
				providerOrder.getAll(options).then(function(success) {
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
				ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + code + '?action=print');
			}

			self.savePDF = function(code) {
				ElectronWindow.createWindow(window.location.href.split('#')[0] + '#/order/print/' + code + '?action=pdf');
			}

		}

}());