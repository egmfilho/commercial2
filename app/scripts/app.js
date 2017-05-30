/*
* @Author: egmfilho
* @Date:   2017-05-26 10:21:29
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-30 15:37:48
*/
'use strict';

angular.module('commercial2.constants', [ ]);
angular.module('commercial2.controllers', [ ]);
angular.module('commercial2.services', [ ]);

angular.module('commercial2', [
		'ngAnimate',
		'ngRoute',
		'ngSanitize',
		'ngResource',
		'ngCookies',
		'ngMessages',
		'ngMaterial',
		'egmfilho.keys',
		'commercial2.constants',
		'commercial2.controllers',
		'commercial2.services'
	])
	.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
		$httpProvider.interceptors.push('Interceptor');
		$locationProvider.hashPrefix('');
	}])
	.config(['$mdThemingProvider', function($mdThemingProvider) {

		// https://angular-md-color.com/#/

		$mdThemingProvider.definePalette('customPrimary', {
			'50': '#b2d2f3',
			'100': '#9cc5ef',
			'200': '#86b8ec',
			'300': '#70abe8',
			'400': '#5a9ee5',
			'500': '#4491e1',
			'600': '#2e84dd',
			'700': '#2177d1',
			'800': '#1e6bbb',
			'900': '#1a5ea5',
			'A100': '#c8dff6',
			'A200': '#deebfa',
			'A400': '#f4f8fd',
			'A700': '#17528f',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('customAccent', {
			'50': '#b15206',
			'100': '#c95d07',
			'200': '#e26908',
			'300': '#f6750d',
			'400': '#f78326',
			'500': '#f8913e',
			'600': '#faad70',
			'700': '#fbbb88',
			'800': '#fcc9a1',
			'900': '#fdd7b9',
			'A100': '#faad70',
			'A200': '#F99F57',
			'A400': '#f8913e',
			'A700': '#fde5d2',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.theme('default')
			.primaryPalette('customPrimary')
			.accentPalette('customAccent');
			// .backgroundPalette('grey', {
			// 	'default': '200'
			// });
	}])
	.config(['$routeProvider', function($routeProvider) {

		$routeProvider
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.when('/', {
				templateUrl: 'views/home.html',
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/order', {
				templateUrl: 'views/order.html',
				controller: 'OrderCtrl',
				controllerAs: 'order'
			})
			.when('/order-tab', {
				templateUrl: 'views/order-tab.html',
				controller: 'OrderCtrl',
				controllerAs: 'order'
			})
			.when('/about', {
				templateUrl: 'views/about.html',
				controller: 'AboutCtrl',
				controllerAs: 'about'
			})
			.otherwise({
				redirectTo: '/'
			});

	}])
	.run(['$rootScope', '$location', '$mdToast', function($rootScope, $location, $mdToast) {

		$rootScope.$on('$routeChangeStart', function(event, next, current) {

			$rootScope.currentPath = $location.path();

		});

		$rootScope.getNumber = function(num) {
			return new Array(Math.max(0, Math.ceil(num)));
		};

		$rootScope.toast = function(message, class) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass(class)
					.textContent(message)
					.position('top left right')
					.hideDelay(3000)
			);
		}
		
	}]);
