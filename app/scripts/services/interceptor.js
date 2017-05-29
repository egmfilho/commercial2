/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-29 13:51:32
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = [ '$q', '$location', '$cookies', '$httpParamSerializerJQLike', 'Constants' ];

	function Interceptor($q, $location, $cookies, $httpParamSerializerJQLike, constants) {

		return {
			'request': 		 request,
			'responseError': responseError
		}

		// ******************************
		// Methods declaration
		// ******************************

		function request(req) {
			if (constants['bypass-login']) {
				console.log('bypassing login');
				req.headers['x-session-token'] = 'lucilei';
			}

			req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			req.data = $httpParamSerializerJQLike(req.data);
			return req;
		}

		function responseError(rejection) {
			if (rejection.status == 401) {
				if ($cookies.get('currentUser')) {
					$cookies.remove('currentUser');
				}

				$location.path('/login');
			}

			return $q.reject(rejection);
		}
	}

}());