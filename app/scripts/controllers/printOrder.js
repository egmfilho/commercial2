/*
* @Author: egmfilho
* @Date:   2017-06-05 17:56:31
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-05 18:11:52
*/

(function() {

	'use strict';

	angular.module('commercial2.controllers')
		.controller('PrintOrderCtrl', PrintOrder);

	function PrintOrder() {

		setTimeout(function() {
			console.log('carregou orçamento');

			var electron = require('electron');
			electron.remote.getCurrentWebContents().print();
		}, 2000);

	}

}());