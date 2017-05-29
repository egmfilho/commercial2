/*
* @Author: egmfilho
* @Date:   2017-05-29 10:49:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 18:00:24
*/

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': 'http://172.16.0.82/commercial.dafel/php/',
			'cookie': 'commercial.currentUser',
			'bypass-login': false,
			'debug': true
		});

}());