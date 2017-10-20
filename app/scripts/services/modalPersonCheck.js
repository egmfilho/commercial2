/*
 * @Author: alessandro
 * @Date: 2017-10-20 17:12:42 
 * @Last Modified by:   egmfilho 
 * @Last Modified time: 2017-10-20 17:12:42 
 */

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ModalPersonCheck', [ '$rootScope', '$timeout', 'ProviderPerson', 'Constants', function($rootScope, $timeout, providerPerson, constants) {

			var _isOpen = true;

			return {
				show: function( title, people, personCategory ) {
					
					var controller;

					controller = function() {
						var vm = this;

						this.category = personCategory;
						this.hoverIndex = -1;

						if (constants.isElectron) {
							var scope = this;
							Mousetrap.bind('up', function() {
								$timeout(function() {
									scope.hoverIndex = Math.max(0, scope.hoverIndex - 1);
									jQuery('table[name="person-check"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});

							Mousetrap.bind('down', function() {
								$timeout(function() {
									scope.hoverIndex = Math.min(scope.result.length - 1, scope.hoverIndex + 1);
									jQuery('table[name="person-check"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
								});
								return false;
							});	
						}

						this._showCloseButton = true;

						this.result = people;

						this.grid = {
							propertyName: 'person_name',
							reverse: true
						}

						this.sortBy = function(propertyName){
							vm.grid.reverse = (vm.grid.propertyName === propertyName) ? !vm.grid.reverse : false;
							vm.grid.propertyName = propertyName;
						};

						this.get = function(p){							
							if( p.person_active == 'Y'){
								scope.close(p);
							} else{
								$rootScope.customDialog().showConfirm('Aviso', 'Cliente inativo. Deseja ativá-lo?').then(function(){
									$rootScope.loading.load();
									providerPerson.activate(p.person_id, vm.category).then(function(success) {
										$rootScope.loading.unload();
										scope.close(p);
									}, function(error) {
										$rootScope.loading.unload();
										$rootScope.customDialog().showMessage('Erro', error.data.satatus.description);
									});
								});
							}
						}

						this.close = function(p) {
							if (constants.isElectron) {
								Mousetrap.unbind('up');
								Mousetrap.unbind('down');
							}
							vm._close(p);
						};
					};

					var modalOptions = {
						zIndex: 2,
						hasBackdrop: true,
						innerDialog: false,
						focusOnOpen: true,
						clickOutsideToClose: false,
						escapeToClose: false,
						width: 500
					};

					return $rootScope.customDialog().showTemplate(title, './partials/modalPersonCheck.html', controller, modalOptions);
				}
			}
		}]);

})();