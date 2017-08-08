/*
* @Author: egmfilho
* @Date:   2017-05-29 14:03:46
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-08 11:27:00
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('LoginCtrl', ['$rootScope', '$scope', '$location', 'Authentication', function($rootScope, $scope, $location, authentication) {

			var self = this;

			$scope.$on('$viewContentLoaded', function() {
				jQuery('input[name="user"]').select().focus();
			});

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
						case 200: 
							$location.path('loading');
							break;
						default:
							break;
					}
				});
			}

		}]);

}());