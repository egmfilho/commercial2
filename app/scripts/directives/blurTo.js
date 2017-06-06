/*
* @Author: egmfilho
* @Date:   2017-06-06 16:06:50
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 16:37:02
*/

(function() {

	'use strict';

	angular.module('commercial2.directives')
		.directive('blurTo', ['$timeout', function($timeout) {
			var blur;

			function link(scope, element, attrs, ctrl) {
				element.bind('blur', function(e) {
					$timeout(function() {
						element[0].value = scope.$eval(attrs.blurTo);
					});
				});	
			}

			return {
				restrict: 'A',
				link: link
			}

		}]);
}());