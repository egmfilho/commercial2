/*
* @Author: egmfilho
* @Date:   2017-06-16 12:29:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-22 12:38:15
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.service('CustomDialogManager', CustomDialogManager);

	function CustomDialogManager() {
		var _openDialogs = [ ];

		this.addDialog = function(dialog) {
			_openDialogs.push(dialog);
		};

		this.removeDialog = function(dialog) {
			_openDialogs.splice(_openDialogs.indexOf(dialog), 1);
		};

		this.closeAll = function() {
			angular.forEach(_openDialogs, function(d) {
				d.close();
			});

			_openDialogs = [ ];
		};
	}

}());