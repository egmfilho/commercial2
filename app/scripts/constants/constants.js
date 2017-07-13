/*
* @Author: egmfilho
* @Date:   2017-05-29 10:49:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-13 18:02:35
*/

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': 'http://172.16.0.82/commercial2.api/',
			'version': '2.0',
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron']
		});

}());