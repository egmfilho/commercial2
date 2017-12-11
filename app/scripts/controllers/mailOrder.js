/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-27 12:24:55
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-11 13:29:57
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('MailOrderCtrl', MailOrder);

	MailOrder.$inject = [ '$rootScope', '$scope', '$q', '$timeout', '$routeParams', '$http', 'ProviderOrder', 'Order', 'Globals', 'Constants', 'ElectronPrinter' ];

	function MailOrder($rootScope, $scope, $q, $timeout, $routeParams, $http, provider, Order, Globals, constants, ElectronPrinter) {

		var self = this;
		self.template = null;
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
			},
			newContact: function(chip) {
				if (angular.isObject(chip))
					return chip;

				return {
					name: 'Externo',
					mail: chip
				};
			}
		};
		
		self.mailArray = [{ 
			name: Globals.get('user').user_name,
			mail: Globals.get('user').user_mail
		}];

		self.focusSearchInput = function() {
			jQuery(".box input").focus().select();
		};

		function createFilterForQuery(query) {
			var lowercaseQuery = angular.lowercase(query);

			return function(n) {
				return (n.name.toLowerCase().indexOf(lowercaseQuery) >= 0) || (n.mail.toLowerCase().indexOf(lowercaseQuery) >= 0);
			};
		}

		$scope.now = moment().tz('America/Sao_Paulo').toDate();
		$scope.globals = Globals.get;

		$scope.zoomIn = function() {
			jQuery('.chico-bento .preview .print-container .print-order').removeClass('zoom-50');
		};

		$scope.zoomOut = function() {
			jQuery('.chico-bento .preview .print-container .print-order').addClass('zoom-50');
		};

		function getTempalte(code) {
			return $http({
				method: 'POST',
				url: Globals.api.get().address + 'order.php?action=getPrint',
				data: {
					order_code: code
				}
			});
		}

		$scope.$on('$viewContentLoaded', function() {
			if ($routeParams.code) {
				$rootScope.loading.load();
				$q.all([
					getTempalte($routeParams.code),
					getOrder($routeParams.code)
				]).then(function(success) {
					if (success[0]) {
						self.template = success[0].data;
					}

					if (success[1]) {
						self.form.message = 'Segue em anexo o orçamento de código ' + self.order.order_code + ' em formato PDF.';
						
						var parsedMails = self.order.order_client.person_contact.map(function(c) {
								return {
									name: c.person_address_contact_name,
									mail: c.person_address_contact_value
								}
							}),
							mainContact = self.order.order_client.person_contact.filter(function(c) {
								return c.person_address_contact_main == 'Y';
							})[0];

						if (mainContact) {
							self.form.to.push({
								name: mainContact.person_address_contact_name,
								mail: mainContact.person_address_contact_value
							});
						}

						self.mailArray = self.mailArray.concat(parsedMails);

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
					}
					$rootScope.loading.unload();
				}, function(error) {
					$rootScope.loading.unload();
					if (error.length == 2 && error[1]) {
						$rootScope.customDialog().showMessage('Erro', 'Erro ao receber os dados do pedido!');
					}
				});
			}
		});

		function getOrder(code) {
			var deferred = $q.defer();

			var options = {
				getCompany: true,
				getCompanyAddress: true,
				getCustomer: true,
				getContacts: true,
				contactType: Globals.get('mail-contact-id'),
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

		function closeWindow() {
			require('electron').remote.getCurrentWindow().close();
		}

		this.send = function() {
			if (!self.form.to.length) {
				$rootScope.customDialog().showMessage('Aviso', 'Nenhum destinatário informado!');
				return;
			}

			if (constants.isElectron)
				$rootScope.loading.load('Aguarde', 'Enviando email...');

			ElectronPrinter.getHexPDF()
				.then(function(success) {
					$http({
						method: 'POST',
						url: Globals.api.get().address + 'order.php?action=sendMail',
						data: { 
							order_code: self.order.order_code,
							to: self.form.to,
							subject: self.form.subject,
							message: self.form.message,
							pdf: success 
						}
					}).then(function(success) {
						$rootScope.loading.unload();
						$rootScope.customDialog().showMessage('Sucesso', 'O email será enviado.')
							.then(function(success){ }, function(error) {
								closeWindow();
							});
					}, function(error) {
						constants.debug && console.log(error);
						$rootScope.customDialog().showMessage('Erro', error.data.status.description);
						$rootScope.loading.unload();
					});
				}, function(error) {
					$rootScope.customDialog().showMessage('Erro', 'Erro ao anexar arquivo PDF.');
				});
		};

	}

})();