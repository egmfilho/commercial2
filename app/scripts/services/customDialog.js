/*
* @Author: egmfilho
* @Date:   2017-05-31 09:00:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-01 17:47:38
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CustomDialog', CustomDialog)

	CustomDialog.$inject = [ '$mdPanel' ];

	function CustomDialog($mdPanel) {

		var _animation, _animationPosition, _config;

		function Dialog() {
			_animationPosition = {
				top: 0,
				left: document.documentElement.clientWidth / 2 - 250
			};

			_animation = $mdPanel.newPanelAnimation()
				.duration(200)
				// .openFrom(_animationPosition)
				// .closeTo(_animationPosition)
				.withAnimation($mdPanel.animation.SCALE);
		}

		Dialog.prototype = {
			showMessage: showMessage,
			showTemplate: showTemplate
		};

		return Dialog;

		// ******************************
		// Internal methods
		// ******************************

		/**
		 * Instancia uma janela com uma mensagem no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 */	
		function showMessage(title, message) {
			return show(title, message);
		}

		/**
		 * Instancia uma janela com um template e um controller no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 */	
		function showTemplate(title, templateUrl, controller) {
			return show(title, null, templateUrl, controller);
		}

		/**
		 * Configura e cria a janela.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 */	
		function show(title, message, templateUrl, controller) {			
			
			// aqui coloca o controller do template
			// dentro do controller padrao da janela
			var _controller = function($controller, $scope, mdPanelRef) {
				var vm = this;

				if (controller)
					angular.extend(this, $controller(controller, { '$scope': $scope, 'mdPanelRef': mdPanelRef }));

				this._title 	  = title;
				this._message 	  = message;
				this._templateUrl = templateUrl;

				this._closeDialog = function() {
					if (mdPanelRef) mdPanelRef.close();
				};
			};
			_controller.$inject = [ '$controller', '$scope', 'mdPanelRef' ];

			_config = {
				attatchTo: angular.element(document.body),
				controller: _controller,
				controllerAs: 'ctrl',
				templateUrl: './partials/customDialogTemplate.html',
				panelClass: 'custom-dialog',
				animation: _animation,
				fullscreen: false,
				hasBackdrop: false,
				position: $mdPanel.newPanelPosition().absolute().center(),
				trapFocus: true,
				zIndex: 80, // nao aumentar para nao ficar na frente do menu do select
				clickOutsideToClose: true,
				escapeToClose: true,
				focusOnOpen: true
			};

			return $mdPanel.open(_config);	
		}
	}

}());