/*
* @Author: egmfilho
* @Date:   2017-05-24 17:37:37
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-27 13:46:39
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = [ '$rootScope', '$scope', '$timeout', '$http', 'Globals', 'Constants' ];

	function HomeCtrl($rootScope, $scope, $timeout, $http, Globals, constants) {

		var self = this;

		// $http.get('http://172.16.0.82/commercial2.api/dashboard.php').then(function(res) {
		// 	self.template = res.data;
		// });

	}
}());