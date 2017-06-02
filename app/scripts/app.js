/*
* @Author: egmfilho
* @Date:   2017-05-26 10:21:29
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-02 18:10:05
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
		'egmfilho.inputFilters',
		'ui.mask',
		'ngStorage',
		'commercial2.constants',
		'commercial2.controllers',
		'commercial2.services'
	])
	.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
		$httpProvider.interceptors.push('Interceptor');
		$locationProvider.hashPrefix('');
	}])
	.config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
		// Esconde a mascara quando o input nao esta focado para evitar
		// provlemas com os labels do Angularjs Material
		uiMaskConfigProvider.addDefaultPlaceholder(false);
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
			.when('/logout', {
				templateUrl: 'views/logout.html',
				controller: 'LogoutCtrl',
				controllerAs: 'logout'
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
	.run(['$rootScope', '$location', '$sessionStorage', 'Constants', function($rootScope, $location, $sessionStorage, constants) {

		if (constants.isEletron && !$sessionStorage[constants['cookie']] || true) {
			console.log('esta usando electron e nao tem sessao');
			var electron = require('electron'),
				session;

			session = electron.remote.getCurrentWindow();
			console.log('sessao', session.teste);

			// if (session) {
			// 	console.log('recebeu uma sessao', session);
			// 	$sessionStorage[constants['cookie']] = session;
			// }
		}

		// Aqui verifica se o usuario esta logado. 
		// Caso contrario redireciona para tela de login.
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			$rootScope.currentPath = $location.path();

			if (!$sessionStorage[constants.cookie]) {
				if (next && next.templateUrl) {
					// Redireciona para tela de login apenas se a url nao for a de impressao
					//  ou a propria tela de login
					if (next.templateUrl !== 'views/login.html' && next.templateUrl.indexOf('printOrder.html') < 0) {
						$location.path('/login');
					}
					return;
				}
			}
		});

	}])
	.run(['$rootScope', '$mdToast', 'MainMenu', 'CustomDialog', function($rootScope, $mdToast, mainMenu, customDialog) {

		// Retorna um array vazio com o length especificado.
		// Para ser usado no ng-repeat.
		$rootScope.getNumber = function(num) {
			return new Array(Math.max(0, Math.ceil(num)));
		};

		// Funcao generica para chamar o Toast na tela.
		$rootScope.toast = function(message, class) {
			$mdToast.show(
				$mdToast.simple()
					.toastClass(class)
					.textContent(message)
					.position('top left right')
					.hideDelay(3000)
			);
		};

		// Exibe o menu principal
		$rootScope.showMainMenu = function() {
			return new mainMenu().show();
		};

		// Retorna uma nova instancia da janela de modal.
		$rootScope.customDialog = function() {
			return new customDialog();
		};
		
	}]);
