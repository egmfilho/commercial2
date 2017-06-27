/*
* @Author: egmfilho
* @Date:   2017-05-26 10:21:29
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-27 14:02:36
*/
'use strict';

angular.module('commercial2.constants', [ ]);
angular.module('commercial2.services', [ ]);
angular.module('commercial2.directives', [ ]);
angular.module('commercial2.controllers', [ ]);

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
		'commercial2.constants',
		'commercial2.services',
		'commercial2.directives',
		'commercial2.controllers'
	])
	.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
		$httpProvider.interceptors.push('Interceptor');
		$locationProvider.hashPrefix('');
	}])
	.config(['uiMask.ConfigProvider', function(uiMaskConfigProvider) {
		/* Esconde a mascara quando o input nao esta focado para evitar */
		/* provlemas com os labels do Angularjs Material */
		uiMaskConfigProvider.addDefaultPlaceholder(false);
	}])
	.config(['$mdThemingProvider', function($mdThemingProvider) {

		/* https://angular-md-color.com/#/ */

		$mdThemingProvider.definePalette('customAccent', {
			'50': '#893e07',
			'100': '#a24908',
			'200': '#ba5409',
			'300': '#d25f0a',
			'400': '#ea6a0c',
			'500': '#f4771c',
			'600': '#f6944c',
			'700': '#f7a365',
			'800': '#f9b17d',
			'900': '#fac095',
			'A100': '#f6944c',
			'A200': '#f58634',
			'A400': '#f4771c',
			'A700': '#fbcead',
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
			.when('/loading', {
				templateUrl: 'views/afterLogin.html',
				controller: 'AfterLoginCtrl',
				controllerAs: 'afterLogin'
			})
			.when('/logout', {
				templateUrl: 'views/logout.html',
				controller: 'LogoutCtrl',
				controllerAs: 'logout'
			})
			.when('/', {
				module: 'home',
				templateUrl: 'views/home.html',
				controller: 'HomeCtrl',
				controllerAs: 'home'
			})
			.when('/order/:action', {
				module: 'order',
				templateUrl: 'views/order.html',
				controller: 'OrderCtrl',
				controllerAs: 'order'
			})
			.when('/open-order', {
				module: 'open-order',
				templateUrl: 'views/open-order.html',
				controller: 'OpenOrderCtrl',
				controllerAs: 'openOrder'
			})
			.when('/order/print/:code', {
				templateUrl: 'views/print-order.html',
				controller: 'PrintOrderCtrl',
				controllerAs: 'print'
			})
			.when('/order-tab', {
				templateUrl: 'views/order-tab.html',
				controller: 'OrderCtrl',
				controllerAs: 'order'
			})
			.when('/about', {
				module: 'about',
				templateUrl: 'views/about.html',
				controller: 'AboutCtrl',
				controllerAs: 'about'
			})
			.otherwise({
				redirectTo: '/'
			});

	}])
	.run(['$rootScope', '$location', 'Cookies', 'CustomDialogManager', 'Globals', 'Constants', function($rootScope, $location, Cookies, CustomDialogManager, Globals, constants) {
		/* Aqui verifica se o usuario esta logado. */
		/* Caso contrario redireciona para tela de login. */
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			/* Armazena a localizacao atual para usar nas condicionais das views */
			$rootScope.currentPath = $location.path();

			/* Mata todos os modais ainda abertos */
			CustomDialogManager.closeAll();

			Cookies.get(constants['cookie']).then(function(success) {
				constants.debug && console.log('Cookie de sessão verificado.');
			}, function(error) {
				constants.debug && console.log('cookie de sessao nao encontrado!');
				/* Redireciona para tela de login apenas se a url */
				/* nao for a de impressao ou a propria tela de login */
				if (next.templateUrl && next.templateUrl !== 'views/login.html' && next.templateUrl.indexOf('print-order.html') < 0) {
					$rootScope.clearCredentials();
					$location.path('/login');
				}
			});
		});

		/* Remove as informacoes temporarias do usuario. */
		$rootScope.clearCredentials = function() {
			Globals.clear();
		};

	}])
	.run(['$rootScope', '$mdToast', 'MainMenu', 'CustomDialog', 'Constants', function($rootScope, $mdToast, mainMenu, customDialog, constants) {

		/* Numero de versao atual do sistema. */
		$rootScope.version = constants.version;

		/* Controlador de carregamento. */
		/* Exibe e esconde a tela de carregamento. */
		$rootScope.loading = {
			dialog: null,
			count: 0,
			isLoading: function() { return this.count > 0 },
			load: function() { 
				if (this.count == 0) {
					if (!this.dialog) 
						this.dialog = $rootScope.customDialog();
					this.dialog.showUnclosable('Aguarde', 'Carregando informações...');
				}
				this.count++; 
			},
			unload: function() { 
				this.count--; 
				this.count = Math.max(this.count, 0); 
				if (this.count == 0);
					this.dialog.close();
			}
		};

		/* Retorna um array vazio com o length especificado. */
		/* Para ser usado no ng-repeat. */
		$rootScope.getNumber = function(num) {
			return new Array(Math.max(0, Math.ceil(num)));
		};

		/* Funcao generica para chamar o Toast na tela. */
		$rootScope.toast = function(message, class, action, delay) {
			return $mdToast.show(
				$mdToast.simple()
					.position("top right")
					.hideDelay(delay || 5000)
					.textContent(message)
					.toastClass(class)
					.action(action)
			);
		};

		/* Exibe o menu principal */
		$rootScope.showMainMenu = function() {
			return new mainMenu().show();
		};

		/* Retorna uma nova instancia da janela de modal. */
		$rootScope.customDialog = function() {
			return new customDialog();
		};
		
	}]);
