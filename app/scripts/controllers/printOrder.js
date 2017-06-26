/*
* @Author: egmfilho
* @Date:   2017-06-05 17:56:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-26 14:27:09
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	PrintOrder.$inject = [ '$rootScope', '$scope', '$routeParams', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function PrintOrder($rootScope, $scope, $routeParams, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.order = new Order();

		$scope.now = new Date();
		$scope.globals = Globals.get;
		$scope.constants = constants;

		// setTimeout(function() {
		// 	console.log('carregou orçamento');

		// 	var electron = require('electron');
		// 	ElectronPrinter.savePDF();
		// }, 2000);

		$scope.$on('$viewContentLoaded', function() {
			if ($routeParams.code) {
				getOrder($routeParams.code);
			}
		});

		function getOrder(code) {
			var options = {
				getCompany: true,
				getCompanyAddress: true,
				getCustomer: true,
				getSeller: true,
				getItems: true,
				getPayments: true,
				getTerm: true,
				getDeliveryAddress: true
			};

			$rootScope.loading.load();
			provider.getByCode(code, options).then(function(success) {
				self.order = new Order(success.data);
				constants.debug && console.log(self.order);
				$rootScope.loading.unload();
				ElectronPrinter.savePDF();
			}, function(error) {
				constants.debug && console.log('error');
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

	}

}());