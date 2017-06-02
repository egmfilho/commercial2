/*
* @Author: egmfilho
* @Date:   2017-06-01 15:57:25
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-02 09:18:08
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('MainMenu', MainMenu)

	MainMenu.$inject = [ '$mdPanel' ];

	function MainMenu($mdPanel) {

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

			var controller = function($location, mdPanelRef) {
				this._goTo = function(path) {
					if (path) $location.path(path);
					if (mdPanelRef) mdPanelRef.close();
				};
			};
			controller.$inject = [ '$location', 'mdPanelRef' ];

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

}());