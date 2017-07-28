/*
* @Author: egmfilho
* @Date:   2017-07-27 12:24:55
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-28 14:37:50
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('MailOrderCtrl', MailOrder);

	MailOrder.$inject = [ '$rootScope', '$scope', '$q', '$timeout', '$routeParams', '$http', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function MailOrder($rootScope, $scope, $q, $timeout, $routeParams, $http, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.order = new Order();
		self.logo = null;
		
		self.form = {
			to: [ ],
			subject: 'Envio de orçamento',
			message: ''
		};
		
		self.internal = {
			selectedItem: null,
			searchText: '',
			querySearch: function(query) {
				return query ? self.mailArray.filter(createFilterForQuery(query)) : [];
			}
		};
		
		self.mailArray = [{ name: 'Alfonse', mail: 'brown@alfonse.com' }, { name: 'Alabama', mail: 'bama@ala.com' }, { name: 'Alessandro', mail: 'alessandro@dafel.com.br' }];

		self.transformChip = function(chip) {
			if (angular.isObject(chip))
				return chip;

			return { name: chip, type: 'new' };
		};

		self.focusSearchInput = function() {
			jQuery(".box input").focus().select();
		};

		function createFilterForQuery(query) {
			var lowercaseQuery = angular.lowercase(query);

			return function(n) {
				return (n.name.toLowerCase().indexOf(lowercaseQuery) >= 0) || (n.mail.toLowerCase().indexOf(lowercaseQuery) >= 0);
			}
		}

		$scope.now = new Date();
		$scope.globals = Globals.get;

		$scope.zoomIn = function() {
			console.log('teste');
			jQuery('.chico-bento .preview .print-container .print-order').removeClass('zoom-50');
		};

		$scope.zoomOut = function() {
			console.log('teste2');
			jQuery('.chico-bento .preview .print-container .print-order').addClass('zoom-50');
		};

		$scope.$on('$viewContentLoaded', function() {
			if ($routeParams.code) {
				getOrder($routeParams.code)
					.then(function(success) {
						$timeout(function() {
							jQuery('.chico-bento .preview .print-container').on('DOMMouseScroll mousewheel', function(e) { 
								
								var $this = $(this),
									scrollTop = this.scrollTop,
									scrollHeight = this.scrollHeight,
									height = $this.height(),
									delta = (e.type == 'DOMMouseScroll' ?
										e.originalEvent.detail * -40 :
										e.originalEvent.wheelDelta),
									up = delta > 0;

								var prevent = function() {
									e.stopPropagation();
									e.preventDefault();
									e.returnValue = false;
									return false;
								}
								
								if (!up && -delta > scrollHeight - height - scrollTop) {
									// Scrolling down, but this will take us past the bottom.
									$this.scrollTop(scrollHeight);
									return prevent();
								} else if (up && delta > scrollTop) {
									// Scrolling up, but this will take us past the top.
									$this.scrollTop(0);
									return prevent();
								}

							});
						});
					});
			}
		});

		function getOrder(code) {
			var deferred = $q.defer();

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
				deferred.resolve();
			}, function(error) {
				constants.debug && console.log('error');
				$rootScope.loading.unload();
				$rootScope.customDialog().showMessage('Erro', error.data.status.description);
				deferred.reject();
			});

			return deferred.promise;
		}

		this.send = function() {
			console.log(self.form);

			if (constants.isElectron)
				$rootScope.loading.load('Aguarde', 'Enviando email...');

			ElectronPrinter.getHexPDF()
				.then(function(success) {
					$http({
						method: 'POST',
						url: constants.api + 'order.php?action=sendMail',
						data: { 
							order_code: self.order.order_code,
							to: self.form.to,
							subject: self.form.subject,
							message: self.form.message,
							pdf: success 
						}
					}).then(function(success) {
						$rootScope.loading.unload();
						$rootScope.customDialog().showMessage('Sucesso', 'O email foi enviado!');
					}, function(error) {
						constants.debug && console.log(error);
						$rootScope.loading.unload();
					});
				}, function(error) {
					$rootScope.customDialog().showMessage('Erro', 'Erro ao anexar arquivo PDF.');
				});
		};

	}

}());