(function() {

	'use strict';

	angular.module('commercial2.directives')
		.directive('compile', ['$compile', function($compile) {
			
			return function(scope, element, attrs) {
				var ensureCompileRunsOnce = scope.$watch(function(scope) {
					// Watch the 'compile' expression for changes
					return scope.$eval(attrs.compile);
				}, function(value) {
					// When the 'compile' expression changes
                	// assign it into the current DOM
					element.html(value);

					// Compile the new DOM and link it to the current scope.
					// NOTE: we only compile .childNodes so that
					// we don't get into infinite loop compiling ourselves
					$compile(element.contents())(scope);

					// Use un-watch feature to ensure compilation happens only once.
					ensureCompileRunsOnce();
				});
			};

		}]);

})();