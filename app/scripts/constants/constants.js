/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-05-29 10:49:05
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-13 11:30:30
 */

(function() {

	'use strict';
	var _ver = '2.0.0';

	if (window && window.process && window.process.versions['electron']) {
		_ver = require('electron').remote.getGlobal('version').value || '2.*';
	}

	angular.module('commercial2.constants')
		.constant('Constants', {
			'api': [ // comentar antes de dar build
				{
					'id': 0, 
					'name': 'Local', 
					'root': 'http://172.16.0.6/',
					'address': 'http://172.16.0.6/commercial2.api/' 
				},
				{
					'id': 1, 
					'name': 'Local Teste', 
					'root': 'http://172.16.0.6/',
					'address': 'http://172.16.0.6/commercial2.api.teste/' 
				},
				{
					'id': 2,
					'name': 'Externo Altarede', 
					'root': 'http://187.16.252.130/',
					'address': 'http://187.16.252.130/commercial2.api/' 
				},
				{
					'id': 3,
					'name': 'Externo NQT', 
					'root': 'http://186.219.4.163/',
					'address': 'http://186.219.4.163/commercial2.api/'
				},
				{
					'id': 4,
					'name': 'Alessandro Notebook', 
					'root': 'http://172.16.0.176/',
					'address': 'http://172.16.0.176/commercial2.api/'
				}
			],
			'app-name': 'Commercial - Gestor de vendas',
			'version': _ver,
			'cookie': 'commercial.currentUser',
			'debug': false,
			'isElectron': window && window.process && window.process.versions['electron'],
			'zoomFactor': 1
		});

})();