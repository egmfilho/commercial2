/*
* @Author: egmfilho
* @Date:   2017-05-29 10:49:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-21 14:05:46
*/

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': 'http://172.16.0.82/commercial2.api/',
			'version': '2.0',
			'cookie': 'commercial.currentUser',
			'debug': true,
			'isElectron': window && window.process && window.process.versions['electron'],
			'default-person-type': 'F'
		});

}());