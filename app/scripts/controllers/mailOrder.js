/*
* @Author: egmfilho
* @Date:   2017-07-27 12:24:55
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-27 18:10:18
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('MailOrderCtrl', MailOrder);

	MailOrder.$inject = [ '$rootScope', '$scope', '$timeout', '$routeParams', '$http', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function MailOrder($rootScope, $scope, $timeout, $routeParams, $http, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.order = new Order();
		self.logo = null;

		$scope.now = new Date();
		$scope.globals = Globals.get;

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

		this.send = function() {
			ElectronPrinter.getRawPDF()
				.then(function(success) {
					console.log('tamanho do pdf', success.length);
					$http({
						method: 'POST',
						url: constants.api + 'order.php?action=sendMail',
						data: { pdf: JSON.stringify(success) }
					}).then(function(success) {
						alert('enviou');
					}, function(error) {
						alert('enviou mas deu erro!');
					});
				}, function(error) {
					$rootScope.customDialog().showMessage('Erro', 'Erro ao anexar arquivo PDF.');
				});
		};

	}

}());