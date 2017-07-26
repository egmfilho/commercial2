/*
* @Author: egmfilho
* @Date:   2017-07-26 09:44:01
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-26 10:48:31
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ElectronOS', ['Constants', function(constants) {

			var _os = null,
				_hostname = '',
				_interfaces = [ ];

			if (constants.isElectron) {
				_os = require('os');
				getInfos();
			}

			function getInfos() {
				if (!_os)
					return;

				_hostname = _os.hostname();

				var array = [].concat.apply([], Object.values(_os.networkInterfaces())),
					filtered = array.filter(function(x) { return x.family === 'IPv4' && !x.internal });

				_interfaces = filtered.map(function(n) {
					return {
						address: n.address,
						mac: n.mac
					};
				});
			}

			return {
				getHostname: function() { return _hostname; },
				getNetworkInterfaces: function() { return _interfaces; }
			}

		}]);

}());