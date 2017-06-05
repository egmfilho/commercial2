/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-05 13:36:44
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = ['$location', 'Cookies', '$httpParamSerializerJQLike', 'Constants' ];

	function Interceptor($location, Cookies, $httpParamSerializerJQLike, constants) {

		return {
			'request': 		 request,
			'responseError': responseError
		}

		// ******************************
		// Methods declaration
		// ******************************

		function request(req) {
			if (constants['bypass-login']) {
				console.log('bypassing login with private token');
				req.headers['x-session-token'] = 'lucilei';
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

				$location.path('/login');
			}

			return $q.reject(rejection);
		}
	}

}());