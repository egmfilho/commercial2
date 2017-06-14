/*
* @Author: egmfilho
* @Date:   2017-05-24 17:37:37
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-14 10:08:25
*/

(function() {
	'use strict';

	angular.module('commercial2.controllers')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = [ '$scope', '$timeout', '$http' ];

	function HomeCtrl($scope, $timeout, $http) {

		// $http.get('http://172.16.0.82/alabama/public/admin/').then(function(res) {
			// console.log(res);
		// });

	}
}());