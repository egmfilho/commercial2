/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-03 18:07:48
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = [ '$location', '$q', '$httpParamSerializerJQLike', 'Cookies', 'Globals', 'Constants', 'ElectronOS' ];

	function Interceptor($location, $q, $httpParamSerializerJQLike, Cookies, Globals, constants, ElectronOS) {

		return {
			'request': 		 request,
			'responseError': responseError
		}

		// ******************************
		// Methods declaration
		// ******************************

		function request(req) {
			/* Injeta a sessao atual do usuario */
			if (Globals.get('session-token')) {
				constants.debug && console.log('injetando sessao no request');
				req.headers['x-session-token'] = Globals.get('session-token');
			}

			if (constants.isElectron && ElectronOS.getHostname()) {
				req.headers['Hostname'] = ElectronOS.getHostname();
			}

			if (constants.isElectron && ElectronOS.getNetworkInterfaces()) {
				req.headers['Host-Info'] = JSON.stringify(ElectronOS.getNetworkInterfaces());
			}

			req.headers['System-Version'] = constants.version;
			req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			req.data = $httpParamSerializerJQLike(req.data);
			return req;
		}

		function responseError(rejection) {
			if (rejection.status == 401) {
				$location.path('/logout');

				if (constants.isElectron) {
					require('electron').ipcRenderer.send('shutdown', null);
				}
			}

			return $q.reject(rejection);
		}
	}

}());