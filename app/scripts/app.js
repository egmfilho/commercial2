'use strict';

angular.module('commercial2.controllers', [ ]);

angular.module('commercial2', [
		'ngAnimate',
		'ngRoute',
		'ngSanitize',
		'ngMaterial',
		'commercial2.controllers'
	])
	.config(['$locationProvider', function($locationProvider) {
		$locationProvider.hashPrefix('');
	}])
	.config(['$mdThemingProvider', function($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('blue')
			.accentPalette('blue')
			.backgroundPalette('grey', {
				'default': '200'
			});
	}])
	.config(['$routeProvider', function($routeProvider) {

		$routeProvider
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
			.when('/about', {
				templateUrl: 'views/about.html',
				controller: 'AboutCtrl',
				controllerAs: 'about'
			})
			.otherwise({
				redirectTo: '/'
			});

	}]);
