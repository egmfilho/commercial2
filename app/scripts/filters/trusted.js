(function() {

	'use strict';

	angular.module('commercial2.services')
		.filter('trusted', ['$sce', function($sce) {

			return function(html) {
				return $sce.trustAsHtml(html);
			}

		}]);

}());