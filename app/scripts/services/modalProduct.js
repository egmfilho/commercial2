(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalProduct', [ '$rootScope', '$timeout', 'Globals', 'Constants', function($rootScope, $timeout, Globals, constants) {

			return {
				show: function( title, companyId, userPrice, options ) {
					
					var controller;
					
					$timeout(function(){
						jQuery('input[ng-model="ctrl.filter.name"]').focus();
					},100);

					controller = function(providerProduct, Product, OrderItem) {
						var vm = this, selection = new Array();

						this.hoverIndex = -1;

						if (constants.isElectron) {
							var scope = this;
							Mousetrap.bind('up', function() {
								$timeout(function() {
									console.log('up');
									scope.hoverIndex = Math.max(0, scope.hoverIndex - 1);
									jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});

							Mousetrap.bind('down', function() {
								$timeout(function() {
									console.log('down');
									scope.hoverIndex = Math.min(scope.result.length - 1, scope.hoverIndex + 1);
									jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});	
						}

						this._showCloseButton = true;

						this.result = [];
						this.filter = {
							name: '',
							active: true
						};
						
						this.companyId = companyId;
						this.userPrice = userPrice;
						this.options = options;

						this.grid = {
							propertyName: 'product_name',
							reverse: true
						}

						this.sortBy = function(propertyName) {
							vm.grid.reverse = (vm.grid.propertyName === propertyName) ? !vm.grid.reverse : false;
							vm.grid.propertyName = propertyName;
						};

						function endSearch() {
							vm.hoverIndex = -1;
							jQuery('input[ng-model="ctrl.filter.name"]').blur();
							jQuery('table[name="clementino"] tbody tr:nth-child(0)').focus();
						}

						this.search = function(filter) {
							if( !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerProduct.getByFilter(vm.filter, vm.companyId, vm.userPrice.price_id, vm.options).then(function(success) {
								vm.result = success.data.map(function(p) { return new Product(p); });
								endSearch();
								$rootScope.loading.unload();
								if( !vm.result.length ){
									$rootScope.customDialog().showMessage('Aviso', 'Nenhum produto localizado.');
									return;
								}
							}, function(error) {
								$rootScope.loading.unload();
							});
						}

						this.select = function(p){
							if( p.product_active == 'Y'){
								if (constants.isElectron) {
									Mousetrap.unbind('up');
									Mousetrap.unbind('down');
								}

								$rootScope.loading.load();
								getByCode(p.product_code).then(function(success) {
									$rootScope.loading.unload();
									var item = new OrderItem({ price_id: vm.userPrice.price_id, user_price: vm.userPrice });
									item.setProduct(new Product(success.data));
									vm._close([ item ]);
								}, function(error) {
									constants.debug && console.log(error);
									$rootScope.loading.unload();
									$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								});
							}
						}

						function getByCode(code) {
							var options = {
								getUnit: true,
								getPrice: true,
								getStock: true
							};

							return providerProduct.getByCode(code, vm.companyId, vm.userPrice.price_id, options);
						}

						this.addProduct = function(product) {
							if (product.product_active == 'N')
								return;

							if (!this.isSelected(product)) {
								$rootScope.loading.load();
								getByCode(product.product_code).then(function(success) {
									$rootScope.loading.unload();
									var item = new OrderItem({ price_id: vm.userPrice.price_id, user_price: vm.userPrice });
									item.setProduct(new Product(success.data));
									selection.push(item);
								}, function(error) {
									constants.debug && console.log(error);
									$rootScope.loading.unload();
									$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								});
							} else {
								selection.splice(selection.indexOf(this.isSelected(product)), 1);
							}
						};

						this.isSelected = function(product) {
							return selection.find(function(item) {
								return item.product.product_id == product.product_id;
							});
						};

						this.getSelectionLength = function() {
							return selection.length;
						}

						this.close = function() {
							if (constants.isElectron) {
								Mousetrap.unbind('up');
								Mousetrap.unbind('down');
							}

							vm._close(selection);
						};
					};

					controller.$inject = [ 'ProviderProduct', 'Product', 'OrderItem' ];

					var modalOptions = {
						attatchTo: angular.element(document.getElementById('order')),
						zIndex: 1,
						hasBackdrop: false,
						innerDialog: true,
						focusOnOpen: false
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalProduct.html', controller, modalOptions);
				}
			}
		}]);

}());