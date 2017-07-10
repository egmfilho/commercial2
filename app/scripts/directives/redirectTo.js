/*
* @Author: egmfilho
* @Date:   2017-07-10 12:00:13
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-10 12:02:27
*/

(function() {

	'use strict';

	angular.module('commercial2.directives')
		.directive('redirectTo', ['$location', function($location) {

			return function(scope, element, attrs) {
				var path = attrs.redirectTo;

				element.bind('click', function() {
					scope.$apply(function() {
						$location.path(path);
					});
				});
			}

		}]);

}());