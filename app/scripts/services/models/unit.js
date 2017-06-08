/*
* @Author: egmfilho
* @Date:   2017-06-08 16:28:45
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-08 16:31:24
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Unit', [function() {

			var _unit = {
				unit_id: null, 
				unit_code: null,
				unit_initials: null, 
				unit_name: null,
				unit_format: null
			};

			function Unit(unit) {
				angular.extend(this, _unit);

				if (unit) {
					angular.extend(this, unit);
				}
			}

			return Unit;

		}]);

}());