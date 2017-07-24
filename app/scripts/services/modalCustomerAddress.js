/*
* @Author: egmfilho
* @Date:   2017-07-20 08:24:35
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 12:59:02
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
							escapeToClose: false, 
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

						$scope.$on('newAddress', function(event, args) {
							var newAddress = new Address(args);

							vm.customer.person_address.push(newAddress);
							
							if (args.person_address_delivery == 'Y')
								vm.selectAddress(newAddress);

							vm.selectedTabIndex = 0;
						});
					};

					controller.$inject = [ '$scope' ];

					return $rootScope.customDialog().showTemplate('Endereços', './partials/modalCustomerAddress.html', controller, options);
				}
			}
		}]);

}());