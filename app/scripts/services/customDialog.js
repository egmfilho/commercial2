/*
* @Author: egmfilho
* @Date:   2017-05-31 09:00:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-12 11:40:59
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CustomDialog', CustomDialog)

	CustomDialog.$inject = [ '$q', '$mdPanel' ];

	function CustomDialog($q, $mdPanel) {

		var _dialog, _animation, _animationPosition, _config, _unclosable;

		function Dialog() {
			_unclosable = false;

			_animationPosition = $mdPanel.newPanelPosition().absolute().center();

			_animation = $mdPanel.newPanelAnimation()
				.duration(100)
				.openFrom(_animationPosition)
				.closeTo(_animationPosition)
				.withAnimation($mdPanel.animation.FADE);
		}

		Dialog.prototype = {
			showMessage: showMessage,
			showConfirm: showConfirm,
			showTemplate: showTemplate,
			unclosable: unclosable,
			close: close
		};

		return Dialog;

		// ******************************
		// Internal methods
		// ******************************

		/**
		 * Instancia uma janela com uma mensagem no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showMessage(title, message) {
			return show(title, message);
		}

		/**
		 * Instancia uma janela de confirmacao com um botao positivo e um negativo.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showConfirm(title, message) {
			var controller = function($scope) {
				$scope.positiveButton = {
					label: 'Sim',
					action: $scope._resolve
				};

				$scope._negativeButton = {
					label: 'Não',
					action: $scope._reject
				};
			};
			controller.$inject = [ '$scope' ];

			return show(title, message, null, controller);
		}

		/**
		 * Instancia uma janela com um template e um controller no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showTemplate(title, templateUrl, controller) {
			return show(title, null, templateUrl, controller);
		}

		/**
		 * Remove os botoes e o footer da janela.
		 * A janela so poderá ser fechada via código.
		 */
		function unclosable() {
			_unclosable = true;
			return this;
		}

		/**
		 * Fecha a janela.
		 */
		function close() {
			_dialog.close();
		}

		/**
		 * Configura e cria a janela.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function show(title, message, templateUrl, controller) {

			var deferred = $q.defer();			
			
			/* aqui coloca o controller do template  */
			/* dentro do controller padrao da janela */
			var _controller = function($controller, $scope, mdPanelRef) {
				var vm = this;

				this._title 	  = title;
				this._message 	  = message;
				this._templateUrl = templateUrl;
				this._unclosable  = _unclosable;

				$scope._reject = function() {
					deferred.reject();
					if (mdPanelRef) mdPanelRef.close();
				};

				$scope._resolve = function() {
					deferred.resolve();
					if (mdPanelRef) mdPanelRef.close();
				};

				$scope._negativeButton = {
					label: 'Fechar',
					action: $scope._reject
				};

				if (controller)
					angular.extend(this, $controller(controller, { '$scope': $scope, 'mdPanelRef': mdPanelRef }));
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
				hasBackdrop: _unclosable,
				position: $mdPanel.newPanelPosition().absolute().center(),
				trapFocus: !_unclosable,
				zIndex: 80, // nao aumentar para nao ficar na frente do menu do select
				clickOutsideToClose: !_unclosable,
				escapeToClose: !_unclosable,
				focusOnOpen: true
			};

			_dialog = $mdPanel.create(_config);
			_dialog.open();

			return deferred.promise;
		}
	}

}());