/*
* @Author: egmfilho
* @Date:   2017-05-29 14:03:46
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-22 16:25:18
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'Authentication', 'Globals', 'Constants', function($rootScope, $scope, $location, $timeout, authentication, Globals, constants) {

			var self = this, _ipcRenderer = null;

			$scope.$on('$viewContentLoaded', function() {
				jQuery('input[name="user"]').select().focus();
			});

			this.advance = function() {
				jQuery('input[name="pass"]').select().focus();
			};

			this.submitForm = function() {
				if (!self.user && ! self.pass) return;

				$rootScope.writeLog('Logging in...');				

				authentication.login(self.user, self.pass, function(res) {
					switch (res.status.code) {
						case 401: 
							$rootScope.toast('Aviso', 'Usuário não autorizado.');
							break;
						case 404: 
							//$rootScope.toast('Erro', 'Usuário ou senha inválidos.');
							$rootScope.toast('Aviso', res.status.description);
							break;
						case 412:

							break;
						case 200: 
							$location.path('loading');
							break;
						default:
							break;
					}
				});
			};

			this.forgottenPassword = function() {
				$rootScope.customDialog().showMessage('Aviso', 'Por favor entre em contato com o suporte!');
			};

			this.getCurrentApi = function() {
				if (!Globals.api.get()) {
					Globals.api.set(Globals.api.getList()[0]);
				}

				return Globals.api.get();
			};

			this.selectApi = function() {
				var controller = function() {
					this._showCloseButton = true;
					this.array = Globals.api.getList();

					this.hoverIndex = Globals.api.get().id;
					this.close = function() {
						if (this.hoverIndex >= 0)
							this._close(this.array[this.hoverIndex]);
						else
							this._cancel();
					};
	
					if (constants.isElectron) {
						var scope = this,
							Mousetrap = require('mousetrap');

						Mousetrap.bind('up', function() {
							$timeout(function() {
								scope.hoverIndex = Math.max(0, scope.hoverIndex - 1);
								jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
							});
							return false;
						});
	
						Mousetrap.bind('down', function() {
							$timeout(function() {
								scope.hoverIndex = Math.min(scope.array.length - 1, scope.hoverIndex + 1);
								jQuery('table[name="clementino"] tbody tr:nth-child(' + (scope.hoverIndex + 1) + ')').focus();
							});
							return false;
						});	
					}
	
					jQuery('table[name="clementino"]').focus();
	
				};
	
				var options = {
					width: 400,
					focusOnOpen: false,
				};
	
				$rootScope.customDialog().showTemplate('Selecionar API', './partials/modalApi.html', controller, options)
					.then(function(success) {
						Globals.api.set(success);
					}, function(error) { 
						if (constants.isElectron) {
							var Mousetrap = require('mousetrap');

							Mousetrap.unbind('up');
							Mousetrap.unbind('down');
						}
					});
			}

		}]);

})();