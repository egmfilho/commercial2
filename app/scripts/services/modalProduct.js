(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalProduct', [ '$rootScope', '$timeout', 'Globals', function($rootScope, $timeout, Globals) {

			return {
				show: function( title, companyId, priceId, options ) {
					
					var controller;
					
					$timeout(function(){
						jQuery('#focus').focus();
					},400);

					controller = function(providerProduct, Product) {
						var vm = this;

						this._showCloseButton = true;

						this.result = [];
						this.filter = {
							name: '',
							active: true
						};
						
						this.companyId = companyId;
						this.priceId = priceId;
						this.options = options;

						this.grid = {
							propertyName: 'product_name',
							reverse: true
						}

						this.sortBy = function(propertyName) {
							vm.grid.reverse = (vm.grid.propertyName === propertyName) ? !vm.grid.reverse : false;
							vm.grid.propertyName = propertyName;
						};

						this.search = function(filter) {
							if( !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerProduct.getByFilter(vm.filter, vm.companyId, vm.priceId, vm.options).then(function(success) {
								vm.result = success.data.map(function(p) { return new Product(p); });
								$rootScope.loading.unload();
								if( !vm.result.length ){
									$rootScope.customDialog().showMessage('Aviso', 'Nenhum produto localizado.');
									return;
								}
							}, function(error) {
								$rootScope.loading.unload();
							});
						}

						this.get = function(p){
							if( p.product_active == 'Y'){
								vm._close(p);
							}
						}
					};

					controller.$inject = [ 'ProviderProduct', 'Product' ];

					var modalOptions = {
						attatchTo: angular.element(document.getElementById('order')),
						zIndex: 1,
						hasBackdrop: false,
						innerDialog: true
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalProduct.html', controller, modalOptions);
				}
			}
		}]);

}());