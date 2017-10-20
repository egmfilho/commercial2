/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-08-30 08:28:24
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-30 08:43:16
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('WebWorker', ['$q', function($q) {

			function run(fn) {
				return new Worker(window.URL.createObjectURL(new Blob(['('+fn+')()'])));
			}

			return {
				execute: function(fn, sendData) {
					var deferred = $q.defer();

					const worker = run(fn);

					worker.onmessage = function(event) {
						deferred.resolve(event.data);
					};

					if (sendData)
						worker.postMessage(sendData);

					return deferred.promise;
				}
			}

		}]);

})();