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
			}

			this.forgottenPassword = function() {
				$rootScope.customDialog().showMessage('Aviso', 'Por favor entre em contato com o suporte!');
			};

		}]);

}());