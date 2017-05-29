/*
* @Author: egmfilho
* @Date:   2017-05-29 14:03:46
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 17:39:33
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$mdToast', 'Authentication', function($mdToast, authentication) {

			var self = this;

			this.submitForm = function() {
				if (!self.user && ! self.pass) return;

				authentication.login(self.user, self.pass, function(res) {
					switch (res.status.code) {
						case 401: 
							toast('Aviso! Usuário não autorizado.');
							break;
						case 404: 
							toast('Aviso! Usuário ou senha inválidos.');
							break;
						case 200: 
							toast('Login efetuado.');
							break;
						default:
							break;
					}
				});
			}

			function toast(message) {
				$mdToast.show(
					$mdToast.simple()
						.textContent(message)
						.position('bottom right')
						.hideDelay(3000)
				);
			}

		}]);

}());