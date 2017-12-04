/*
 * @Author: alessandro
 * @Date:   2017-08-09 09:36:07
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-28 17:23:06
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalPerson', [ '$rootScope', '$timeout', 'Globals', 'Constants', function($rootScope, $timeout, Globals, constants) {

			var _isOpen = true;

			return {
				show: function( title, category, options ) {
					
					var controller;

					$timeout(function(){
						jQuery('#focus').focus();
					},100);

					controller = function(providerPerson, Person) {
						var vm = this;

						this.hoverIndex = -1;

						if (constants.isElectron) {
							var scope = this;
							Mousetrap.bind('up', function() {
								$timeout(function() {
									scope.hoverIndex = Math.max(0, scope.hoverIndex - 1);
									jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});

							Mousetrap.bind('down', function() {
								$timeout(function() {
									scope.hoverIndex = Math.min(scope.result.length - 1, scope.hoverIndex + 1);
									jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});	
						}

						this._showCloseButton = true;

						this.result = [];

						this.filter = {
							category: category,
							name: '',
							doc: '',
							contact: '',
							address: 0,
							active: false
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

						function endSearch() {
							vm.hoverIndex = -1;
							jQuery('input[ng-model="ctrl.filter.name"]').blur();
							jQuery('table[name="clementino"] tbody tr:nth-child(0)').focus();
						}

						this.search = function(filter){
							if( !vm.filter.contact.length && !vm.filter.doc.length && !vm.filter.name.length ){
								$rootScope.customDialog().showMessage('Aviso', 'Pelo menos um dos campos deverá ser informado.');
								return;
							}							
							$rootScope.loading.load();
							providerPerson.getByFilter(vm.filter, Object.assign({},vm.options,{
								getAddress: vm.filter.address
							})).then(function(success) {
								vm.result = success.data.map(function(p) {
									var person = new Person(p);
									person.person_address_main_string = person.person_address.length ? person.person_address[0].toString() : '--';
									return person;
								});
								$rootScope.loading.unload();
								endSearch();
								if( !vm.result.length ){
									$rootScope.customDialog().showMessage('Aviso', 'Nenhum ' + options.module + ' localizado.');
									return;
								}
							}, function(error) {
								$rootScope.loading.unload();
								$rootScope.customDialog().showMessage('Erro', error.data.status.description);
								vm.result = [];
								endSearch();
							});
						}

						this.get = function(p){
							if( p.person_active == 'Y'){
								if (constants.isElectron) {
									Mousetrap.unbind('up');
									Mousetrap.unbind('down');
								}
								vm._close(p);
							} else {
								$rootScope.customDialog().showConfirm('Aviso', 'Cliente inativo. Deseja ativá-lo?').then(function(){
									$rootScope.loading.load();
									providerPerson.activate(p.person_id, vm.filter.category).then(function(success) {
										$rootScope.loading.unload();
										vm._close(p);
									}, function(error) {
										$rootScope.loading.unload();
										$rootScope.customDialog().showMessage('Erro', error.data.status.description);
									});
								});
							}
						}
					};

					controller.$inject = [ 'ProviderPerson', 'Person' ];

					var modalOptions = {
						zIndex: 1,
						hasBackdrop: false,
						innerDialog: true,
						focusOnOpen: false
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalPerson.html', controller, modalOptions);
				}
			}
		}]);

})();