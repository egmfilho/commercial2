/*
* @Author: egmfilho
* @Date:   2017-06-08 16:28:45
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-21 08:36:26
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Unit', [function() {

			function Unit(unit) {
				this.unit_id       = null;
				this.unit_code     = null;
				this.unit_initials = null;
				this.unit_name     = null;
				this.unit_format   = null;

				if (unit) {
					angular.extend(this, unit);
				}
			}

			return Unit;

		}]);

}());