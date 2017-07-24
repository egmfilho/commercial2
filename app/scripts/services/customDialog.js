/*
* @Author: egmfilho
* @Date:   2017-05-31 09:00:47
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 12:54:20
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('CustomDialog', CustomDialog);

	CustomDialog.$inject = [ '$q', '$mdPanel', 'CustomDialogManager' ];

	function CustomDialog($q, $mdPanel, CustomDialogManager) {

		var _animationPosition, _animation;

		function Dialog() {
			this._dialog = null;

			_animationPosition = $mdPanel.newPanelPosition().absolute().center();
			_animation = $mdPanel.newPanelAnimation()
				.duration(100)
				.openFrom(_animationPosition)
				.closeTo(_animationPosition)
				.withAnimation($mdPanel.animation.FADE);
		}

		Dialog.prototype = {
			showUnclosable: showUnclosable,
			showMessage: showMessage,
			showConfirm: showConfirm,
			showTemplate: showTemplate,
			close: close
		};

		return Dialog;

		// ******************************
		// Internal methods
		// ******************************

		function showUnclosable(title, message) {
			function controller() {
				this._showProgress = true;
			}

			return show(this, title, message, null, controller, {
				hasBackdrop: true,
				trapFocus: true,
				clickOutsideToClose: false,
				escapeToClose: false,
				zIndex: 2000,
				width: 300
			});
		}

		/**
		 * Instancia uma janela com uma mensagem no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @param {object} options - Opcoes relativas a janela.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showMessage(title, message, options) {
			function controller() {
				this._showCloseButton = true;
				this._showInfoSign = true;
				this._negativeButtonText = 'Fechar';
			}

			return show(this, title, message, null, controller, options);
		}

		/**
		 * Instancia uma janela de confirmacao com um botao positivo e um negativo.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @param {object} options - Opcoes relativas a janela.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showConfirm(title, message, options) {
			function controller() {
				this._showCloseButton = true;
				this._showConfirmSign = true;
				this._positiveButtonText = 'Sim';
				this._negativeButtonText = 'Não';
			}

			return show(this, title, message, null, controller, options);
		}

		/**
		 * Instancia uma janela com um template e um controller no body.
		 * @param {string} title - O titulo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function showTemplate(title, templateUrl, controller, options) {
			return show(this, title, null, templateUrl, controller, options);
		}

		/**
		 * Fecha a janela.
		 */
		function close() {
			this._dialog.close();
			CustomDialogManager.removeDialog(this._dialog);
		}

		/**
		 * Configura e cria a janela.
		 * @param {string} title - O titulo da janela.
		 * @param {string} message - Mensagem a ser exibida no corpo da janela.
		 * @param {string} templateUrl - Template que será incorporado ao corpo da janela.
		 * @param {(function|string)} controller - (Opcional) Controller usado no template.
		 * @returns {object} Uma promise com o resultado.
		 */	
		function show(scope, title, message, templateUrl, controller, options) {
			var _deferred = $q.defer();

			var locals = {
				_title: title,
				_message: message,
				_templateUrl: templateUrl,
				_width: options && options.width ? options.width : 300,
				_close: function(res) {
					_deferred.resolve(res);
					scope._dialog.close();
				},
				_cancel: function(res) {
					_deferred.reject(res);
					scope._dialog.close();
				}
			};

			var _options = {
				attatchTo: angular.element(document.body),
				panelClass: 'custom-dialog layout-column flex ' + (options && options.innerDialog ? 'custom-dialog-inner' : ''),
				animation: _animation,
				fullscreen: false,
				hasBackdrop: false,
				position: $mdPanel.newPanelPosition().absolute().center(),
				trapFocus: true,
				zIndex: 80,
				clickOutsideToClose: true,
				escapeToClose: true,
				focusOnOpen: true,
				templateUrl: './partials/customDialogTemplate.html',
				locals: locals,
				controller: controller,
				controllerAs: 'ctrl'
			};

			scope._dialog = $mdPanel.create(angular.extend({ }, _options, options));
			scope._dialog.open();
			CustomDialogManager.addDialog(scope._dialog);

			return _deferred.promise;
		}

	}

}());