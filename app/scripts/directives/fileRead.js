/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-11-08 14:12:52 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-11-08 15:46:26
 */

(function() {

	'use strict';

	angular.module('commercial2.directives')
		.directive("fileRead", [function () {
			return {
				scope: {
					fileRead: "="
				},
				link: function (scope, element, attributes) {
					element.bind("change", function (changeEvent) {
						var reader = new FileReader();

						reader.onloadend = function() {
							if (!scope.fileRead) return;
							
							scope.fileRead({
								data: changeEvent.target.files[0],
								result: reader.result
							});
						};

						if (changeEvent.target.files.length)
							reader.readAsDataURL(changeEvent.target.files[0]);
					});
				}
			};
		}]);

})();