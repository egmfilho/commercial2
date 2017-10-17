/*
* @Author: egmfilho
* @Date:   2017-07-26 13:36:19
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-26 13:43:54
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.filter('trusted', ['$sce', function($sce) {

			return function(html) {
				return $sce.trustAsHtml(html);
			}

		}]);

})();