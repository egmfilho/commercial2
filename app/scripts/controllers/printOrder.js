/*
* @Author: egmfilho
* @Date:   2017-06-05 17:56:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-27 09:00:28
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	PrintOrder.$inject = [ '$rootScope', '$scope', '$timeout', '$location', '$routeParams', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function PrintOrder($rootScope, $scope, $timeout, $location, $routeParams, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.order = new Order();
		self.logo = null;
		self.isPdf = $location.path().indexOf('print') && $routeParams.type && $routeParams.type == 'pdf';

		$scope.now = new Date();
		$scope.globals = Globals.get;

		$scope.$on('$viewContentLoaded', function() {
			if ($routeParams.code) {
				getOrder($routeParams.code);
			}
		});

		self.print = function() {
			if (this.isPdf) {
				ElectronPrinter.savePDF();
			} else {
				ElectronPrinter.print();
			}
		};

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
				constants.debug && console.log(self.order);
				$rootScope.loading.unload();
				
				if (constants.isElectron) {
					$timeout(function() {
						self.print();
					}, 100);
				}
			}, function(error) {
				constants.debug && console.log('error');
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
			});
		}

	}

})();