/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-07-20 08:24:35
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 14:05:08
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalCustomerAddress', [ '$rootScope', 'Person', 'Address', 'Globals', function($rootScope, Person, Address, Globals) {

			return {
				show: function(customer, deliveryAddress) {
					
					var controller,
						options = {
							attatchTo: angular.element(document.getElementById('order')),
							zIndex: 1,
							hasBackdrop: false, 
							escapeToClose: true, 
							innerDialog: true 
						};

					controller = function($scope) {
						var vm = this;

						this._showCloseButton = true;
						this.globals = Globals.get;
						this.selectedTabIndex = 0;
						this.customer         = new Person(customer);
						setTimeout(function() { $scope.$broadcast('modalCustomerAddress', vm.customer); }, 500);
						this.deliveryAddress  = deliveryAddress ? new Address(deliveryAddress) : new Address();
						this.labelTab         = 'Novo endereço';

						this.selectAddress = function(address) {
							this.deliveryAddress = new Address(address);
						};

						this.showAddressContact = function(array) {
							var html = '';
							
							if (array.length) {
								angular.forEach(array, function(item) {
									html += '<b>' + item.person_address_contact_label + ': </b>';
									html += item.person_address_contact_value;
									html += '<br>';
								});
							} else {
								html += 'Nenhum contato cadastrado.'
							}

							$rootScope.customDialog().showMessage('Contatos', html);
						};

						this.showAddressNote = function(note) {
							$rootScope.customDialog().showMessage('Observações', note || 'Nenhuma informação disponível.');
						};

						$scope.$on('cancelAddress', function(event, args) {
							vm.selectedTabIndex = 0;
							vm.labelTab = 'Novo endereço';
						});

						$scope.$on('newAddressRetorno', function(event, args) {
							var newAddress = new Address(args);
							vm.customer.person_address.push(newAddress);							
							if (newAddress.person_address_delivery == 'Y') vm.selectAddress(newAddress);
							vm.selectedTabIndex = 0;
							vm.labelTab = 'Novo endereço';
						});

						$scope.$on('editAddressRetorno', function(event, args) {
							console.log('pesquei aqui', args);
							var newAddress = new Address(args);
							vm.customer.person_address = vm.customer.person_address.map(function(x) {
								return x.person_address_code == newAddress.person_address_code ? newAddress : x;
							});

							if (args.person_address_delivery == 'Y') vm.selectAddress(newAddress);
							vm.selectedTabIndex = 0;
							vm.labelTab = 'Novo endereço';
						});

						this.editAddress = function(a){
							vm.labelTab = 'Editar endereço';
							$scope.$broadcast('editAddress', a);
							vm.selectedTabIndex = 1;
						};

						this.showNewAddress = function(){
							$scope.$broadcast('clearAddress');
							vm.selectedTabIndex = 1;
							vm.labelTab = 'Novo endereço';
						}

					};

					controller.$inject = [ '$scope' ];

					return $rootScope.customDialog().showTemplate('Endereços', './partials/modalCustomerAddress.html', controller, options);
				}
			}
		}]);

})();