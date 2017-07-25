/*
* @Author: egmfilho
* @Date:   2017-07-18 09:11:16
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-25 13:14:25
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.filter('truncate', function() {

			function trunc(value, max, tail) {
				if (!value) 
					return '';

				max = parseInt(max, 10);

				if (!max || value.length <= max)
					return value;

				value = value.substring(0, max);

				var lastSpace = value.lastIndexOf(' ');

				if (lastSpace != -1) {
					if (value.charAt(lastSpace - 1) == ',' || value.charAt(lastSpace - 1) == '.') {
						lastSpace = lastSpace - 1;
					}
				}

				return value.substring(0, lastSpace) + (tail || '…');
			}

			return trunc;

		});

}());