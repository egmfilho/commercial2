/*
* @Author: egmfilho
* @Date:   2017-05-29 11:04:49
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-06 14:32:46
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Interceptor', Interceptor);

	Interceptor.$inject = ['$location', '$q', 'Cookies', '$httpParamSerializerJQLike', 'Constants' ];

	function Interceptor($location, $q, Cookies, $httpParamSerializerJQLike, constants) {

		return {
			'request': 		 request,
			'responseError': responseError
		}

		// ******************************
		// Methods declaration
		// ******************************

		function request(req) {
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