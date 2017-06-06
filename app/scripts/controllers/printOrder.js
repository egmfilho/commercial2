/*
* @Author: egmfilho
* @Date:   2017-06-05 17:56:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 09:07:11
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	PrintOrder.$inject = [ 'ElectronPrinter' ];

	function PrintOrder(ElectronPrinter) {

		setTimeout(function() {
			console.log('carregou orçamento');

			var electron = require('electron');
			ElectronPrinter.savePDF();
		}, 2000);

	}

}());