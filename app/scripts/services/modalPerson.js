(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalPerson', [ '$rootScope', '$timeout', 'Globals', function($rootScope, $timeout, Globals) {

			var _isOpen = true;

			return {
				show: function( title, category, options ) {
					
					var controller;

					$timeout(function(){
						jQuery('#focus').focus();
					},400);

					controller = function(providerPerson, Person) {
						var vm = this;

						this._showCloseButton = true;

						this.result = [];

						this.filter = {
							category: category,
							name: '',
							doc: '',
							active: true
						};
						
						this.options = options;

						this.grid = {
							propertyName: 'person_name',
							reverse: true
						}

						this.sortBy = function(propertyName){
							vm.grid.reverse = (vm.grid.propertyName === propertyName) ? !vm.grid.reverse : false;
							vm.grid.propertyName = propertyName;
						};

						this.search = function(filter){
							if( !vm.filter.doc.length && !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerPerson.getByFilter(vm.filter, vm.options).then(function(success) {
								vm.result = success.data.map(function(p) { return new Person(p); });
								$rootScope.loading.unload();
								if( !vm.result.length ){
									$rootScope.customDialog().showMessage('Aviso', 'Nenhum ' + options.module + ' localizado.');
									return;
								}
							}, function(error) {
								$rootScope.loading.unload();
							});
						}

						this.get = function(p){
							if( p.person_active == 'Y'){
								vm._close(p);
							}
						}
					};

					controller.$inject = [ 'ProviderPerson', 'Person' ];

					var modalOptions = {
						zIndex: 1,
						hasBackdrop: false,
						innerDialog: true
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalPerson.html', controller, modalOptions);
				}
			}
		}]);

}());