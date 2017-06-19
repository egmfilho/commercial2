/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-19 10:39:52
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = [ '$location', '$q', '$httpParamSerializerJQLike', 'Cookies', 'Globals', 'Constants' ];

	function Interceptor($location, $q, $httpParamSerializerJQLike, Cookies, Globals, constants) {

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

			req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			req.data = $httpParamSerializerJQLike(req.data);
			return req;
		}

		function responseError(rejection) {
			if (rejection.status == 401) {
				if (Cookies.get(constants['cookie'])) {
					Cookies.remove(constants['cookie']);
				}
				Globals.clear();

				$location.path('/login');
			}

			return $q.reject(rejection);
		}
	}

}());