/*
* @Author: egmfilho
* @Date:   2017-06-06 08:16:50
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-11 14:21:38
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ElectronWindow', ElectronWindow);

	ElectronWindow.$inject = [ 'Constants', 'Globals' ];

	function ElectronWindow(constants, Globals) {

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
			_remote = _electron.remote,
			_BrowserWindow = _remote.BrowserWindow

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

			var url = window.location.href.split('#')[0] + url;

			var parent = _electron.remote.getCurrentWindow(),
				win = new _BrowserWindow(angular.extend({ }, { 
					devTools: constants.debug,
					width: 1024, 
					height: 768, 
					show: false,
					title: constants['app-name'],
					parent: parent,
					modal: false,
					webPreferences: {
						zoomFactor: constants.zoomFactor
					}
				}, options));

			win.on('page-title-updated', function(e) {
				e.preventDefault();
			});
			
			win.on('ready-to-show', function() {
				win.show();
			});

			win.on('close', function() {
				parent.focus();

				_remote.getGlobal('children').array = _remote.getGlobal('children').array.filter(function(w) {
					w != win;
				});
			});

			win.loadURL(url);

			_remote.getGlobal('children').array = _remote.getGlobal('children').array.concat([win]);

			return win;
		}
	}

}());