/*
* @Author: egmfilho
* @Date:   2017-05-26 10:21:29
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-05-31 17:42:34
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
			.primaryPalette('blue-grey')
			.accentPalette('customAccent');
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
	.run(['$rootScope', '$location', '$mdToast', 'CustomDialog', function($rootScope, $location, $mdToast, customDialog) {

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
		};

		$rootScope.customDialog = function() {
			return new customDialog();
		};
		
	}]);
