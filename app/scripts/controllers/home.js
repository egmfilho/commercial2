/*
* @Author: egmfilho
* @Date:   2017-05-24 17:37:37
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-26 17:26:23
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = [ '$scope', '$timeout', '$http', 'Globals' ];

	function HomeCtrl($scope, $timeout, $http, Globals) {

		var self = this;

		// console.log(Globals.get('user'));

		// $http.get('http://172.16.0.82/commercial2.api/dashboard.php').then(function(res) {
		// 	self.template = res.data;
		// });

	}
}());