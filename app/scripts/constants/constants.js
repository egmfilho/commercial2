/*
* @Author: egmfilho
* @Date:   2017-05-29 10:49:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-16 14:26:26
*/

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': 'http://172.16.0.82/commercial2.api/',
			'app-name': 'Commercial - Gestor de vendas',
			'version': '2.0.0 rc5',
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron'],
			'zoomFactor': 1.15
		});

}());