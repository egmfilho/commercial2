/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 10:49:05
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-01 15:31:08
 */

(function() {

	'use strict';

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': [ // comentar antes de dar build
				{
					'id': 0, 
					'name': 'Local', 
					'address': 'http://172.16.0.6/commercial2.api/' 
				},
				{
					'id': 1, 
					'name': 'Local Teste', 
					'address': 'http://172.16.0.6/commercial2.api.teste/' 
				},
				{
					'id': 2,
					'name': 'Externo Altarede', 
					'address': 'http://187.16.252.130/commercial2.api/' 
				},
				{
					'id': 3,
					'name': 'Externo NQT', 
					'address': 'http://186.219.4.163/commercial2.api/'
				},
				{
					'id': 4,
					'name': 'Alessandro Notebook', 
					'address': 'http://172.16.0.176/commercial2.api/'
				}
			],
			'app-name': 'Commercial - Gestor de vendas',
			'version': '2.0.0 rc8',
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron'],
			'zoomFactor': 1
		});

})();