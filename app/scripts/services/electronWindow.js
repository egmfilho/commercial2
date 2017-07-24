/*
* @Author: egmfilho
* @Date:   2017-06-06 08:16:50
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-24 13:20:59
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ElectronWindow', ElectronWindow);

	ElectronWindow.$inject = [ 'Constants' ];

	function ElectronWindow(constants) {

		// ******************************************
		// Check if it's running on Electron
		// to avoid crash on browser
		// ******************************************
		if (!constants.isElectron) {
			var oops = function() { alert('Disponível apenas na versão desktop.'); };
			return { 
				createWindow: createWindow
			};
		}

		// ******************************
		// Running on Electron
		// ******************************
		var _electron = require('electron'),
			_BrowserWindow = _electron.remote.BrowserWindow;

		return {
			createWindow: createWindow
		}

		// ******************************
		// Methods declaration
		// ******************************

		/**
		* Instancia uma nova janela no Electron
		* @param {string} url - A URL que sera exibida.
		* @param {object} options - Configuracoes da janela.
		*/
		function createWindow(url, options) {

			var win = new _BrowserWindow(angular.extend({ }, { 
				devTools: constants.debug,
				width: 1024, 
				height: 768, 
				show: false,
				title: 'Orçamento',
				parent: _electron.remote.getCurrentWindow(),
				modal: false,
				contextIsolation: false
			}, options));

			win.loadURL(url);
			win.show();

			return win;
		}
	}

}());