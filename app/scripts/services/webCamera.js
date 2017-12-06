/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-12-06 12:03:01 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-06 13:24:19
 */

(function() {
	
	'use strict';

	angular.module('commercial2.services')
		.factory('WebCamera', ['$rootScope', '$q', '$timeout', 'Constants', function($rootScope, $q, $timeout, constants) {

			var _cam, _isEnabled = false;

			if (constants.isElectron) {
				_cam = require('webcamjs');
			}

			function turnOn() {
				if (!_isEnabled) {
					_cam.attach('#camera');
					_isEnabled = true;
				}
			}

			function turnOff() {
				if (_isEnabled) {
					_cam.reset();
					_isEnabled = false;
				}
			}

			function open() {
				var deferred = $q.defer();

				if (!_cam) {
					console.log('Disponivel apenas na versao desktop');
					return;
				}

				var controller = function() {
					var scope = this;

					this._showCloseButton = true;

					this.result = null;
					
					this.capture = function() {
						_cam.snap(function(dataUri) {
							scope.result = dataUri;
							turnOff();
						});
					};

					this.retake = function() {
						scope.result = null;
						$timeout(function() { turnOn() }, 200);
					}

					this.confirm = function() {
						if (scope.result)
							scope._close(scope.result);
						else
							scope._cancel();
					};
				}

				$rootScope.customDialog().showTemplate('Captura', './partials/webCamera.html', controller, {
					onOpenComplete: function() {
						turnOn();
					}
				}).then(function(success) {
					turnOff();
					deferred.resolve(success);
				}, function(error) {
					turnOff();
					deferred.reject();
				});

				return deferred.promise;
			}
			
			return {
				open: open
			}

		}]);

})();