/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 10:49:05
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-20 17:03:17
 */

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			// 'api': [ // comentar antes de dar build
			// 	{
			// 		'id': 0, 
			// 		'name': 'VPN (dev)', 
			// 		'address': 'http://172.16.0.6/commercial2.api/' 
			// 	},
			// 	{
			// 		'id': 1,
			// 		'name': 'VPN Teste (dev)', 
			// 		'address': 'http://172.16.0.6/commercial2.api.teste/'
			// 	},
			// 	{
			// 		'id': 2, 
			// 		'name': 'Externo (dev)', 
			// 		'address': 'http://187.16.252.130/commercial2.api/' 
			// 	},
			// 	{
			// 		'id': 3,
			// 		'name': 'Externo Teste (dev)', 
			// 		'address': 'http://187.16.252.130/commercial2.api.teste/' 
			// 	}
			// ],
			'api': [], // descomentar antes de dar build
			'app-name': 'Commercial - Gestor de vendas',
			'version': '2.0.0 rc6',
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron'],
			'zoomFactor': 1.15
		});

})();