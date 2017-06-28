/*
* @Author: egmfilho
* @Date:   2017-05-24 17:37:37
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-28 10:01:53
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = [ '$rootScope', '$scope', '$timeout', '$http', 'Globals', 'Constants' ];

	function HomeCtrl($rootScope, $scope, $timeout, $http, Globals, constants) {

		var self = this,
			user = Globals.get('user'),
			greeting = user.user_last_session && user.user_last_session.user_session_date ? 'Bem vindo de volta ' : 'Seja bem vindo ';

		$http.get('http://www.commercial.com.br/commercial2.api/dashboard.php').then(function(res) {
			self.template = res.data;
		});

		console.log(Globals.get('user'));
		$rootScope.toast('Boas vindas!', greeting + user.user_name + '!');

		// $http.get('http://172.16.0.82/commercial2.api/dashboard.php').then(function(res) {
		// 	self.template = res.data;
		// });

	}
}());