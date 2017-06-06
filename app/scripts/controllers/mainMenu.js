/*
* @Author: egmfilho
* @Date:   2017-06-06 15:48:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 15:56:34
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.controller('MainMenuCtrl', MainMenuCtrl);

	MainMenuCtrl.$inject = [ 'Cookies', 'Constants' ];

	function MainMenuCtrl(Cookies, constants) {

		var self = this;
		
		Cookies.get(constants['cookie']).then(function(success) {
			self.currentUser = JSON.parse(window.atob(success));
			console.log(self.currentUser);
		}, function(error) {
			constants.debug && console.log('Cookie de sessao nao encontrado pelo main menu.');
		});

	}

}());