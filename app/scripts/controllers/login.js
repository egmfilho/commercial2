/*
* @Author: egmfilho
* @Date:   2017-05-29 14:03:46
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-22 16:25:18
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'Authentication', 'Constants', function($rootScope, $scope, $location, $timeout, authentication, constants) {

			var self = this, _ipcRenderer = null;

			$scope.$on('$viewContentLoaded', function() {
				jQuery('input[name="user"]').select().focus();
			});

			if (constants.isElectron) {
				_ipcRenderer = require('electron').ipcRenderer;

				_ipcRenderer.on('update', function(event, arg) {
					var options = {
						hasBackdrop: true,
						clickOutsideToClose: false,
						escapeToClose: false
					};

					function ctrl() {
						var scope = this;
						_ipcRenderer.on('update-progress', function(event, arg) {
							$timeout(function() {
								scope.progress = (arg.progress / 1000000.0).toFixed(2);
								scope.total = (arg.total / 1000000.0).toFixed(2);
								scope.percent = (scope.progress * 100) / scope.total;
							});
						});
					};

					$rootScope.customDialog().showTemplate('Atualização', './partials/modalUpdate.html', ctrl, options);
				});
			}
			

			this.advance = function() {
				jQuery('input[name="pass"]').select().focus();
			};

			this.submitForm = function() {
				if (!self.user && ! self.pass) return;

				authentication.login(self.user, self.pass, function(res) {
					switch (res.status.code) {
						case 401: 
							$rootScope.toast('Erro', 'Usuário não autorizado.');
							break;
						case 404: 
							$rootScope.toast('Erro', 'Usuário ou senha inválidos.');
							break;
						case 412:
							if (constants.isElectron) {
								$rootScope.customDialog().showConfirm('Aviso de atualização', 'Uma nova versão está disponível, deseja atualizar agora?')
									.then(function(success) {
										_ipcRenderer.send('update');
									}, function(error) { });
							}

							break;
						case 200: 
							$location.path('loading');
							break;
						default:
							break;
					}
				});
			}

			this.forgottenPassword = function() {
				$rootScope.customDialog().showMessage('Aviso', 'Por favor entre em contato com o suporte!');
			};

		}]);

}());