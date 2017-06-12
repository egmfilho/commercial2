/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-12 11:34:00
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = ['$rootScope', '$location', '$q', 'Cookies', '$httpParamSerializerJQLike', 'Constants' ];

	function Interceptor($rootScope, $location, $q, Cookies, $httpParamSerializerJQLike, constants) {

		return {
			'request': 		 request,
			'responseError': responseError
		}

		// ******************************
		// Methods declaration
		// ******************************

		function request(req) {
			/* Injeta a sessao atual do usuario */
			if ($rootScope.session) {
				constants.debug && console.log('injetando sessao no request');
				req.headers['x-session-token'] = $rootScope.session;
			}

			req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			req.data = $httpParamSerializerJQLike(req.data);
			return req;
		}

		function responseError(rejection) {
			if (rejection.status == 401) {
				if (Cookies.get(constants['cookie'])) {
					Cookies.remove(constants['cookie']);
					$rootScope.session = null;
				}

				$location.path('/login');
			}

			return $q.reject(rejection);
		}
	}

}());