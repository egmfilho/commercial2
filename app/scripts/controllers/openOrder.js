/*
* @Author: egmfilho
* @Date:   2017-06-23 17:13:32
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-23 17:32:22
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('OpenOrderCtrl', OpenOrderCtrl);

		OpenOrderCtrl.$inject = [ '$rootScope', '$scope', 'ProviderOrder', 'Order', 'Constants' ];

		function OpenOrderCtrl($rootScope, $scope, providerOrder, Order, constants) {

			var self = this;

			$scope.$on('$viewContentLoaded', function() {
				getOrders();
			});

			function getOrders() {
				var options = {
					getCustomer: true,
					getSeller: true
				};

				self.orders = [];

				$rootScope.loading.load();
				providerOrder.getAll(options).then(function(success) {
					self.orders = success.data.map(function(order) {
						return new Order(order);
					});
					constants.debug && console.log(self.orders);
					$rootScope.loading.unload();
				}, function(error) {
					constants.debug && console.log(error);
					$rootScope.loading.unload();
				});
			}

		}

}());