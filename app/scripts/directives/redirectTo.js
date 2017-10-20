/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-07-10 12:00:13
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 08:58:40
*/

(function() {

	'use strict';

	angular.module('commercial2.directives')
		.directive('redirectTo', ['$location', function($location) {

			return function(scope, element, attrs) {
				element.bind('click', function() {
					scope.$apply(function() {
						$location.path(attrs.redirectTo)
							.search(attrs.queryKey, attrs.queryValue);
					});
				});
			}

		}]);

})();