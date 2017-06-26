/*
* @Author: egmfilho
* @Date:   2017-06-05 17:56:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-26 18:21:13
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	PrintOrder.$inject = [ '$rootScope', '$scope', '$timeout', '$routeParams', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function PrintOrder($rootScope, $scope, $timeout, $routeParams, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.order = new Order();
		self.logo = null;

		$scope.now = new Date();
		$scope.globals = Globals.get;

		constants.debug && console.log('teste: ', require('electron').remote.getGlobal('teste'));
		constants.debug && console.log('node globals: ', require('electron').remote.getGlobal('globals').shared);

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
				self.logo = Globals.get("logo")[self.order.order_company_id].company_logo;
				console.log('logo:', self.logo);
				constants.debug && console.log(self.order);
				$rootScope.loading.unload();
				
				if (constants.isElectron) {
					$timeout(function() {
						if ($routeParams.action && $routeParams.action == 'print')
							ElectronPrinter.print();
						else if ($routeParams.action && $routeParams.action == 'pdf')
							ElectronPrinter.savePDF();
					}, 100);
				}
			}, function(error) {
				constants.debug && console.log('error');
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

	}

}());