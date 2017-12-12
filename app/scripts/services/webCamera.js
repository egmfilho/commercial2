/*
 * @Author: egmfilho &lt;egmfilho@live.com&gt; 
 * @Date: 2017-12-06 12:03:01 
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-06 16:14:38
 */

(function() {
	
	'use strict';

	angular.module('commercial2.services')
		.factory('WebCamera', ['$rootScope', '$q', '$timeout', 'Constants', function($rootScope, $q, $timeout, constants) {

			var _cam, _isEnabled = false;

			if (constants.isElectron) {
				_cam = require('webcamjs');

				if (_cam) {
					_cam.on('error', function(error) {
						$rootScope.customDialog().showMessage('Erro', 'Houve um problema com a câmera');
						$rootScope.writeLog('Webcam error');
						$rootScope.writeLog(JSON.stringify(error));
					});
				}
			}

			function turnOn() {
				if (!_cam) return;

				turnOff();

				// if (!_isEnabled) {
					_cam.attach('#camera');
					_isEnabled = true;
				// }
			}

			function turnOff() {
				if (!_cam) return;

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

					this.camEnabled = function() { return _isEnabled };
					this.result = null;
					
					this.capture = function() {
						if (!_cam) return;

						_cam.snap(function(dataUri) {
							scope.result = dataUri;
							turnOff();
						});
					};

					this.retake = function() {
						scope.result = null;
						$timeout(function() { turnOn() }, 200);
					};

					this.upload = function() {
						jQuery('#open-dialog').click();
					};

					this.watchFile = function(data) {
						console.log(data);
			
						if (data.data.type.indexOf('image/') < 0) {
							$rootScope.customDialog().showMessage('Erro', 'Por favor selecione um arquivo de imagem.');
							return;
						}
			
						$timeout(function() {
							scope.result = data.result;
						});
					};

					this.confirm = function() {
						if (scope.result)
							scope._close(scope.result);
						else
							scope._cancel();
					};
				}

				$rootScope.customDialog().showTemplate('Captura', './partials/webCamera.html', controller, {
					onOpenComplete: function() {
						if (!_cam) return;
						
						_cam.set({
							width: 320,
							height: 240,
							dest_width: 640,
							dest_height: 480,
							image_format: 'jpeg',
							jpeg_quality: 90,
							force_flash: false,
							flip_horiz: true,
							fps: 45
						});
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

			function forcedTurnOff() {
				turnOff();
			}
			
			return {
				open: open,
				forcedTurnOff: forcedTurnOff
			}

		}]);

})();