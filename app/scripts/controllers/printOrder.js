/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-05 17:56:31
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-11 11:29:51
 */

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	PrintOrder.$inject = [ '$rootScope', '$scope', '$timeout', '$location', '$routeParams', '$http', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function PrintOrder($rootScope, $scope, $timeout, $location, $routeParams, $http, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;

		self.template = null;

		self.order = new Order();
		self.logo = null;
		self.isPdf = $location.path().indexOf('print') && $routeParams.type && $routeParams.type == 'pdf';

		self.hasST = false;

		$scope.now = moment().tz('America/Sao_Paulo').toDate();
		$scope.globals = Globals.get;

		$scope.$on('$viewContentLoaded', function() {
			if ($routeParams.code) {
				$rootScope.loading.load();
				$http({
					method: 'POST',
					url: Globals.api.get().address + 'order.php?action=getPrint',
					data: {
						order_code: $routeParams.code
					}
				}).then(function(success) {
					self.template = success.data;
					$rootScope.loading.unload();
				}, function(error) {
					console.log(error);
					getOrder($routeParams.code);
					$rootScope.loading.unload();
				});
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
				self.hasST = Globals.get('st')[self.order.order_company.company_code];
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