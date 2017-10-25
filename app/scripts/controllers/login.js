/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 14:03:46
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-25 12:15:41
 */

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'Authentication', 'Globals', 'Constants', function($rootScope, $scope, $location, $timeout, authentication, Globals, constants) {

			var self = this;

			this.loggingIn = false;

			$scope.$on('$viewContentLoaded', function() {
				jQuery('input[name="user"]').select().focus();

				if (constants.isElectron) {
					var electron = require('electron');

					if (!electron.remote.getGlobal('isValidSession').value)
						electron.remote.getCurrentWindow().setTitle('Commercial - Gestor de Vendas');
				}
			});

			this.advance = function() {
				jQuery('input[name="pass"]').select().focus();
			};

			this.submitForm = function() {
				if (!self.user && ! self.pass) return;

				this.loggingIn = true;				
				var api = Globals.api.get();
				$rootScope.writeLog('Logging at: ['  + api.name + ' - ' + api.address + ']');

				authentication.login(self.user, self.pass, function(res) {
					self.loggingIn = false;

					switch (res.status) {
						case 200: 
							$rootScope.writeLog('Logged in' + ' - ' + (res.data.status.description || '(no status message)'));
							if (!!res.data.status.description) {
								switch (res.data.status.action) {
									case 'update':
										$rootScope.toast('Atualização disponível', res.data.status.description, 10000, {
											positiveButton: {
												label: 'Atualizar',
												action: function() { 
													if (constants.isElectron)
														require('electron').ipcRenderer.send('callUpdater'); 
												}
											}
										});
										// $rootScope.toast('Atualização disponível', 'Deseja atualizar agora ou tentar depois?', 10000);
										break;

									default: 
										$rootScope.toast('Aviso', res.data.status.description);
										break;
								}
							}
							$location.path('loading');
							break;

						case -1:
							$rootScope.writeLog('Could not establish connection to the server!');
							$rootScope.customDialog().showMessage('Erro de conexão', 'Não foi possível conectar com o servidor. Verifique sua conexão com a internet.');
							break;

						default:
							$rootScope.writeLog(res.status + ' - ' + res.data.status.description);
							$rootScope.customDialog().showMessage('Aviso', res.data.status.description);
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
	
				$rootScope.customDialog().showTemplate('Commercial', './partials/modalApi.html', controller, options)
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