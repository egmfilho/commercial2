/*
 * @Author: alessandro
 * @Date: 2017-10-20 17:12:56 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-11 12:32:29
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalProduct', [ '$rootScope', '$timeout', 'Price', 'Globals', 'Constants', function($rootScope, $timeout, Price, Globals, constants) {

			return {
				show: function( title, companyId, userPrice, options ) {
					
					var controller;
					
					$timeout(function(){
						jQuery('input[ng-model="ctrl.filter.name"]').focus();
					},100);

					controller = function(providerProduct, Product, OrderItem) {
						var vm = this, selection = new Array();

						this.multiSelection = true;
						if (options && options.hasOwnProperty('multiSelection'))
							this.multiSelection = options.multiSelection;

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
						this.userPrice = new Price(userPrice);
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

						/* Fecha o modal retornando o produto selecionado */
						this.select = function(p){
							if (selection.length > 0) {
								this.addProduct(p);
								return;
							}

							if( p.product_active == 'Y'){
								if (constants.isElectron) {
									Mousetrap.unbind('up');
									Mousetrap.unbind('down');
								}

								$rootScope.loading.load();
								getByCode(p.product_code).then(function(success) {
									$rootScope.loading.unload();
									if (success.data.product_active == 'N') {
										$rootScope.customDialog().showMessage('Aviso', 'Produto inativo!');
										$rootScope.loading.unload();
										return;
									}

									if (!success.data.product_prices || !success.data.product_prices.length) {
										$rootScope.customDialog().showMessage('Aviso', 'Produto sem preço!');
										$rootScope.loading.unload();
										return;
									}
									
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

						/* Junta o produto com os outros para retornar ao finalizar */
						this.addProduct = function(product) {
							if (product.product_active == 'N')
								return;

							if (!vm.isSelected(product)) {
								$rootScope.loading.load();
								getByCode(product.product_code).then(function(success) {
									$rootScope.loading.unload();
									var item = new OrderItem({ price_id: vm.userPrice.price_id, user_price: vm.userPrice });
									item.setProduct(new Product(success.data));
									selection.push(item);
									vm.showSelection();
								}, function(error) {
									constants.debug && console.log(error);
									$rootScope.loading.unload();
									$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								});
							} else {
								selection.splice(selection.indexOf(vm.isSelected(product)), 1);
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

							if (selection.length) {
								vm._close(selection.filter(function(i) { return i.order_item_amount > 0 }));
							} else {
								vm.hoverIndex >= 0 ? vm.select(vm.result[vm.hoverIndex]) : vm._close();
							}
						};

						this.showSelection = function() {
							var options = {
									width: 800,
									onOpenComplete: function() {
										$timeout(function() {
											jQuery('input').on('focus', function() { this.select(); });
											jQuery('.table tr:last-child td input').focus();
										});
									}
								},
								ctrl = function() {
										this.selection = selection;
										this._showCloseButton = true;
										this.removeItem = vm.addProduct;
										this.updateItemValues = function(i) { 
											var n = i.order_item_amount;
											i.setAmount(n);
										};
										this.focusOkButton = function() {
											jQuery('button[name="ok-button"]').focus();
										};
									};

							$rootScope.customDialog().showTemplate('Seleção de itens', './partials/modalItemSelection.html', ctrl, options);
						}
					};

					controller.$inject = [ 'ProviderProduct', 'Product', 'OrderItem' ];

					var modalOptions = {
						attatchTo: angular.element(document.getElementById('order')),
						zIndex: 1,
						hasBackdrop: false,
						innerDialog: true,
						focusOnOpen: false
					};

					if (options) {
						modalOptions = Object.assign({ }, modalOptions, options);
					}

					return $rootScope.customDialog().showTemplate(title, './partials/modalProduct.html', controller, modalOptions);
				}
			}
		}]);

})();