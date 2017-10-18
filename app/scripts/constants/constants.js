/*
* @Author: egmfilho
* @Date:   2017-05-29 10:49:05
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-09-11 12:00:53
*/

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': [
				{
					'id': 0, 
					'name': 'VPN', 
					'address': 'http://172.16.0.6/commercial2.api/' 
				},
				{
					'id': 1,
					'name': 'VPN Teste', 
					'address': 'http://172.16.0.6/commercial2.api.teste/'
				},
				{
					'id': 2, 
					'name': 'Teste interno', 
					'address': 'http://172.16.0.6/commercial2.api.teste/' 
				},
				{
					'id': 3,
					'name': 'Teste externo', 
					'address': 'http://187.16.252.130/commercial2.api.teste/' 
				}
			],
			// 'api': [],
			'app-name': 'Commercial - Gestor de vendas',
			'version': '2.0.0 rc6',
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron'],
			'zoomFactor': 1.15
		});

})();