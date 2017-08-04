/*
* @Author: egmfilho
* @Date:   2017-06-06 08:16:50
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-04 17:00:55
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
			_BrowserWindow = _electron.remote.BrowserWindow,
			_remote = _electron.remote;

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
					contextIsolation: false,
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

			win.on('closed', function() {
				parent.focus();

				_electron.ipcRenderer.send('redeem', {
					token: Globals.get('session-token'),
					host: constants.api
				});

				_remote.getGlobal('children').array = _remote.getGlobal('children').array.filter(function(w) {
					w != win;
				})
			});

			win.loadURL(url);

			_remote.getGlobal('children').array = _remote.getGlobal('children').array.concat([win]);

			return win;
		}
	}

}());