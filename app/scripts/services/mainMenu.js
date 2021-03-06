/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-01 15:57:25
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 17:54:14
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('MainMenu', MainMenu)

	MainMenu.$inject = [ '$rootScope', '$mdPanel', 'Cookies', 'Constants' ];

	function MainMenu($rootScope, $mdPanel, Cookies, constants) {

		var _instance;

		function Menu() {
			var animationPosition = {
				top: -80,
				left: -70
			};

			var animation = $mdPanel.newPanelAnimation()
				.duration(100)
				.openFrom(animationPosition)
				.closeTo(animationPosition)
				.withAnimation($mdPanel.animation.SCALE);

			var controller = function($location, mdPanelRef, ModalUserPass, ElectronWindow) {
				var scope = this;

				Cookies.get(constants['cookie']).then(function(success) {
					scope.currentUser = JSON.parse(window.atob(success));
					constants.debug && console.log(scope.currentUser);
				}, function(error) {
					constants.debug && console.log('Cookie de sessao nao encontrado pelo main menu.');
				});

				this._goTo = function(path) {
					if (path) $location.path(path);
					if (mdPanelRef) mdPanelRef.close();
				};

				this.newOrder = function() {
					if (constants.isElectron) {
						ElectronWindow.createWindow('#/order/new/' + $rootScope.openOrderFilters.companyId);
						if (mdPanelRef) mdPanelRef.close();
					}
					else {
						if (mdPanelRef) mdPanelRef.close();
						$location.path('/order/new/' + $rootScope.openOrderFilters.companyId);
					}
				};

				this.newUserPass = function() {
					if (mdPanelRef) mdPanelRef.close();
					ModalUserPass.show('Atualizar senha')
						.then(function(success) {
							$rootScope.customDialog().showMessage('Aviso', 'Senha atualizada com sucesso!');
						}, function(error){
							constants.debug && console.log(error);
						});
				};

				this.settings = function() {
					if (!scope.currentUser || !scope.currentUser.user_profile_id || scope.currentUser.user_profile_id != 1001) {
						$rootScope.customDialog().showMessage('Aviso', 'Usuário não autorizado!');
						return;
					}

					if (constants.isElectron) {
						ElectronWindow.createWindow('#/settings');
						if (mdPanelRef) mdPanelRef.close();
					}
					else {
						if (mdPanelRef) mdPanelRef.close();
						$location.path('/settings');
					}
				};

				this.logout = function() {
					$rootScope.customDialog().showConfirm('Aviso', 'Ao efetuar logout todas as alterações não salvas serão perdidas. Deseja continuar?')
						.then(function(success) {
							if (constants.isElectron) {
								if (mdPanelRef) mdPanelRef.close();
								require('electron').ipcRenderer.send('shutdown');
							} else {
								if (mdPanelRef) mdPanelRef.close();
								$location.path('/logout');
							}
						}, function(error) { });
				};
			};
			controller.$inject = [ '$location', 'mdPanelRef', 'ModalUserPass', 'ElectronWindow' ];

			var config = {
				attatchTo: angular.element(document.body),
				controller: controller,
				controllerAs: 'ctrl',
				templateUrl: './partials/mainMenu.html',
				panelClass: 'main-menu',
				animation: animation,
				hasBackdrop: false,
				position: $mdPanel.newPanelPosition().absolute().top('37px').left('5px'),
				zIndex: 100,
				clickOutsideToClose: true,
				escapeToClose: true,
				focusOnOpen: true
			};

			_instance = $mdPanel.create(config);
		}

		Menu.prototype = {
			show: show
		};

		return Menu;

		// ******************************
		// Internal methods
		// ******************************

		/**
		 * Configura e cria o menu.
		 */	
		function show() {			
			if (_instance)
				return _instance.open();
		}
	}

})();