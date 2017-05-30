/*
* @Author: egmfilho
* @Date:   2017-05-29 14:03:46
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 10:56:43
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$rootScope', '$location', 'Authentication', function($rootScope, $location, authentication) {

			var self = this;

			this.submitForm = function() {
				if (!self.user && ! self.pass) return;

				authentication.login(self.user, self.pass, function(res) {
					switch (res.status.code) {
						case 401: 
							$rootScope.toast('Usuário não autorizado.', 'error');
							break;
						case 404: 
							$rootScope.toast('Usuário ou senha inválidos.', 'error');
							break;
						case 200: 
							$location.path('home');
							break;
						default:
							break;
					}
				});
			}

		}]);

}());