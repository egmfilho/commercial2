/*
* @Author: egmfilho
* @Date:   2017-07-10 10:20:38
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-10 10:24:52
*/

(function() {

	'use strict';

	angular.module('commercial2.filters')
		.filter('keyboardShortcut', ['$window', function($window) {

			return function(str) {
				if (!str) return;

				var keys = str.split('-');
				var isOSX = /Mac OS X/.test($window.navigator.userAgent);

				var separator = (!isOSX || keys.length > 2) ? '+' : '';

				var abbreviations = {
					M: isOSX ? '⌘' : 'Ctrl',
					A: isOSX ? 'Option' : 'Alt',
					S: 'Shift'
				};

				return keys.map(function(key, index) {
					var last = index == keys.length - 1;
					return last ? key : abbreviations[key];
				}).join(separator);
			}

		}]);

})();