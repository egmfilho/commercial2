(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalPerson', [ '$rootScope', 'Globals', function($rootScope, Globals) {

			return {
				show: function( title, category, options ) {
					
					var controller;

					controller = function(providerPerson, Person) {
						var vm = this;

						this._showCloseButton = true;

						this.result = [];
						this.filter = {
							category: category,
							name: '',
							doc: ''
						};
						this.options = options;

						this.search = function(filter) {
							if( !vm.filter.doc.length && !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerPerson.getByFilter(vm.filter, vm.options).then(function(success) {
								vm.result = success.data.map(function(p) { return new Person(p); });
								$rootScope.loading.unload();
							}, function(error) {
								$rootScope.loading.unload();
							});
						}
					};

					controller.$inject = [ 'ProviderPerson', 'Person' ];

					return $rootScope.customDialog().showTemplate(title, './partials/modalPerson.html', controller);
				}
			}
		}]);

}());