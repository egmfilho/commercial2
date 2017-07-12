(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalProduct', [ '$rootScope', 'Globals', function($rootScope, Globals) {

			return {
				show: function( title, companyId, priceId, options ) {
					
					var controller;

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

						this.search = function(filter) {
							if( !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerProduct.getByFilter(vm.filter, vm.companyId, vm.priceId, vm.options).then(function(success) {
								vm.result = success.data.map(function(p) { return new Product(p); });
								$rootScope.loading.unload();
							}, function(error) {
								$rootScope.loading.unload();
							});
						}
					};

					controller.$inject = [ 'ProviderProduct', 'Product' ];

					return $rootScope.customDialog().showTemplate(title, './partials/modalProduct.html', controller, {zIndex:20});
				}
			}
		}]);

}());