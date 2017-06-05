/*
* @Author: egmfilho
* @Date:   2017-06-02 12:07:18
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-05 14:33:16
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('Print', Print);

	Print.$inject = [ 'Cookies', 'Constants' ];

	function Print(Cookies, constants) {

		// ******************************************
		// Check if it's running on Electron
		// to avoid crash on browser
		// ******************************************
		if (!constants.isElectron) {
			var oops = function() { alert('Disponível apenas na versão desktop.'); };
			return { 
				print: oops,
				savePDF: oops
			};
		}

		// ******************************
		// Running on Electron
		// ******************************
		var _electron, _dialog, _BrowserWindow, _fs;

		var printSettings = {
			landscape: false,
			marginsType: 0,
			printBackground: false,
			printSelectionOnly: false,
			pageSize: 'A4'
		};

		_electron 	   = require('electron');
		_dialog 	   = _electron.remote.dialog;
		_BrowserWindow = _electron.remote.BrowserWindow;
		_fs 		   = require('fs');

		return {
			print: print,
			savePDF: savePDF
		}

		// ******************************
		// Internal methods
		// ******************************

		/**
		* Instancia uma nova janela no Electron
		*/
		function createWindow() {
			var win = new _BrowserWindow({ 
				devTools: constants.debug,
				width: 800, 
				height: 600, 
				show: false,
				title: 'Orçamento',
				parent: _electron.remote.getCurrentWindow(),
  				modal: false,
  				contextIsolation: false,
  				session: _electron.remote.getCurrentWindow().webContents.session
			});

			return win;
		}

		/**
		* Abre uma nova janela e chama o dialogo de impressao.
		* @param {string} url - Url que deseja imprimir.
		*/
		function print(url) {
			if (!url) return;

			var newWindow = createWindow();
			newWindow.teste = 'teste';
			newWindow.loadURL(url);
			newWindow.show();

			newWindow.webContents.on('dom-ready', function() {
				newWindow.webContents.print();
			});
		}

		/**
		* Abre uma nova janela e chama o dialogo para salvar o PDF.
		* @param {string} url - Url que deseja salvar em PDF.
		*/
		function savePDF(url) {
			if (!url) return;

			var newWindow = createWindow();
			newWindow.teste = 'teste';
			newWindow.loadURL(url);
			newWindow.show();

			newWindow.webContents.on('did-finish-load', function() {
				
				if (!newWindow) {
					_dialog.showErrorBox('Erro', 'A janela não pode ser aberta.');
					return;
				}

				if (!_fs) {
					_dialog.showErrorBox('Erro', 'File System não inicializado.');
					return;	
				}

				_dialog.showSaveDialog(newWindow, { }, function(filePath) {
					if (filePath) {
						newWindow.webContents.printToPDF(printSettings, function(err, data) {
							if (err) {
								_dialog.showErrorBox('Erro', 'Não foi possível gerar o PDF.');
								if (constants.debug) console.log(err);
								return;
							}

							_fs.writeFile(filePath, data, function(err) {
								if (err) {
									_dialog.showErrorBox('Erro', 'Erro ao salvar o arquivo.');
									if (constants.debug) console.log(err);
									return;
								}
							});
						});
					}
				});
			});
		}

	}
}());