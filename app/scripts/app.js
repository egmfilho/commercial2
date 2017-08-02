/*
* @Author: egmfilho
* @Date:   2017-05-26 10:21:29
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-02 08:30:42
*/

'use strict';

/* Ref: http://procbits.com/2012/01/19/comparing-two-javascript-objects */
Object.defineProperty(Object.prototype, 'equals', {
	enumerable: false,
	configurable: true,
	writable: true,
	value: function(x) {
		var p, i;

		if (!x) return false;

		for (p in this)
			if (typeof(x[p]) == 'undefined' && typeof(this[p]) != 'undefined')
				return false;

		for (p in this) {
			if (p != '$$hashKey' && p != 'queryable') {
				if (this[p]) {
					switch (typeof(this[p])) {
						case 'object':
							if (Array.isArray(this[p])) {
								if (this[p].length != x[p].length)
									return false;

								for (i = 0; i < this[p].length; i++)
									if (!this[p][i].equals(x[p][i]))
										return false;
							} else {
								if (!this[p].equals(x[p]))
									return false;
							}

							break;

						case 'function':
							// if (typeof(x[p]) == 'undefined' || (p != 'equals' && this[p].toString() != x[p].toString()))
							// 	return false;
							break;

						default:
							if (this[p] != x[p]) 
								return false;
					}
				} else {
					if (x[p])
						return false;
				}
			}
		}

		for (p in x)
			if (typeof(this[p]) == 'undefined' && typeof(x[p]) != 'undefined')
				return false;

		return true;
	}
});

angular.module('commercial2.constants', [ ]);
angular.module('commercial2.filters', [ ]);
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
		'commercial2.filters',
		'commercial2.services',
		'commercial2.directives',
		'commercial2.controllers'
	])
	.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
		$httpProvider.interceptors.push('Interceptor');
		$locationProvider.hashPrefix('');
	}])
	.config(['$mdDateLocaleProvider', 'uiMask.ConfigProvider', function($mdDateLocaleProvider, uiMaskConfigProvider) {
		/* Formata com leading 0 as datas selecionadas no datepicker */
		$mdDateLocaleProvider.formatDate = function(date) {
			var m = moment(date);
			return m.isValid() ? m.format('L') : '';
		};

		$mdDateLocaleProvider.parseDate = function(dateString) {
			var m = moment(dateString, 'L', true);
			return m.isValid() ? m.toDate() : new Date(NaN);
		}

		/* Esconde a mascara quando o input nao esta focado para evitar */
		/* provlemas com os labels do Angularjs Material */
		uiMaskConfigProvider.addDefaultPlaceholder(false);
	}])
	.config(['$mdThemingProvider', function($mdThemingProvider) {

		/* https://angular-md-color.com/#/ */

		$mdThemingProvider.definePalette('custom-primary', {
			'50': '#8a8a8d',
			'100': '#7d7d81',
			'200': '#717174',
			'300': '#646467',
			'400': '#58585a',
			'500': '#4b4b4d',
			'600': '#3e3e40',
			'700': '#323233',
			'800': '#252526',
			'900': '#191919',
			'A100': '#97979a',
			'A200': '#a4a4a6',
			'A400': '#b1b1b3',
			'A700': '#0c0c0c',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('custom-accent', {
			'50': '#9f3b05',
			'100': '#b84506',
			'200': '#d04e07',
			'300': '#e95707',
			'400': '#f76313',
			'500': '#f8742b',
			'600': '#fa945d',
			'700': '#fba475',
			'800': '#fbb58e',
			'900': '#fcc5a7',
			'A100': '#fa945d',
			'A200': '#f98444',
			'A400': '#f8742b',
			'A700': '#fdd5c0',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('commercial-red', {
			'50': '#eaaaa5',
			'100': '#e59691',
			'200': '#e0837c',
			'300': '#dc6f67',
			'400': '#d75c53',
			'500': '#d2483e',
			'600': '#c8392f',
			'700': '#b3332a',
			'800': '#9f2d25',
			'900': '#8a2720',
			'A100': '#efbeba',
			'A200': '#f4d1cf',
			'A400': '#f9e5e3',
			'A700': '#75211b',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('commercial-orange', {
			'50': '#fde5d2',
			'100': '#fdd7b9',
			'200': '#fcc9a1',
			'300': '#fbbb88',
			'400': '#faad70',
			'500': '#f99f57',
			'600': '#f8913e',
			'700': '#f78326',
			'800': '#f6750d',
			'900': '#e26908',
			'A100': '#fef3eb',
			'A200': '#ffffff',
			'A400': '#ffffff',
			'A700': '#c95d07',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('commercial-green', {
			'50': '#a3d7a5',
			'100': '#92cf94',
			'200': '#80c883',
			'300': '#6ec071',
			'400': '#5cb860',
			'500': '#4caf50',
			'600': '#449d48',
			'700': '#3d8b40',
			'800': '#357a38',
			'900': '#2d682f',
			'A100': '#b5dfb7',
			'A200': '#c7e7c8',
			'A400': '#d9eeda',
			'A700': '#255627',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.definePalette('commercial-blue', {
			'50': '#9acffa',
			'100': '#82c4f8',
			'200': '#6ab8f7',
			'300': '#51adf6',
			'400': '#39a1f4',
			'500': '#2196f3',
			'600': '#0d8aee',
			'700': '#0c7cd5',
			'800': '#0a6ebd',
			'900': '#0960a5',
			'A100': '#b2dbfb',
			'A200': '#cae6fc',
			'A400': '#e3f2fd',
			'A700': '#08528d',
			'contrastDefaultColor': 'light'
		});

		$mdThemingProvider.theme('default')
			.primaryPalette('custom-primary')
			.accentPalette('custom-accent');
	}])
	.config(['$routeProvider', function($routeProvider) {

		$routeProvider
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl',
				controllerAs: 'login',
				resolve: {
					redirect: ['$location', 'Globals', function($location, Globals) {
						if (!!Globals.get('session-token')) {
							$location.path('/open-order');
						} else {
							Globals.clear();
							$location.path('/login');
						}
					}]
				}
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
			// .when('/', {
			// 	module: 'home',
			// 	templateUrl: 'views/home.html',
			// 	controller: 'HomeCtrl',
			// 	controllerAs: 'home'
			// })
			.when('/order/:action', {
				module: 'order',
				templateUrl: 'views/order.html',
				controller: 'OrderCtrl',
				controllerAs: 'order'
			})
			.when('/open-order', {
				module: 'open-order',
				templateUrl: 'views/open-order-dense.html',
				controller: 'OpenOrderCtrl',
				controllerAs: 'openOrder'
			})
			.when('/order/print/:code', {
				templateUrl: 'views/print-order.html',
				controller: 'PrintOrderCtrl',
				controllerAs: 'print'
			})
			.when('/order/mail/:code', {
				templateUrl: 'views/mail-order.html',
				controller: 'MailOrderCtrl',
				controllerAs: 'mail'
			})
			.when('/about', {
				module: 'about',
				templateUrl: 'views/about.html',
				controller: 'AboutCtrl',
				controllerAs: 'about'
			})
			// .when('/config', {
			// 	module: 'config',
			// 	templateUrl: 'views/config.html',
			// 	controller: 'ConfigCtrl',
			// 	controllerAs: 'config'
			// })
			.otherwise({
				redirectTo: '/login'
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

		/* Titulo exibido na barra de ferraments do Commercial. */
		$rootScope.titleBarText = '';

		/* Controlador de carregamento. */
		/* Exibe e esconde a tela de carregamento. */
		$rootScope.loading = {
			dialog: null,
			count: 0,
			isLoading: function() { return this.count > 0 },
			load: function(title, message) { 
				if (this.count == 0) {
					if (!this.dialog) 
						this.dialog = $rootScope.customDialog();
					this.dialog.showUnclosable(title || 'Aguarde', message || 'Carregando informações...');
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
		$rootScope.toast = function(title, message, delay) {
			var controller = function() {
				this.title = title,
				this.message = message,
				this.close = $mdToast.cancel;
			}

			return $mdToast.show({
				hideDelay: delay || 5000,
				position: 'bottom right',
				controller: controller,
				controllerAs: 'ctrl',
				templateUrl: './partials/toastTemplate.html'
			});
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
