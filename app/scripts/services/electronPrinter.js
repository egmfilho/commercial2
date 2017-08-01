/*
* @Author: egmfilho
* @Date:   2017-06-02 12:07:18
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-01 10:52:16
*/

(function() {

	'use strict';

	angular.module('commercial2.services')
		.factory('ElectronPrinter', ElectronPrinter);

	ElectronPrinter.$inject = [ '$q', 'Constants' ];

	function ElectronPrinter($q, constants) {

		// ******************************************
		// Check if it's running on Electron
		// to avoid crash on browser
		// ******************************************
		if (!constants.isElectron) {
			var oops = function() { alert('Disponível apenas na versão desktop.'); };
			return { 
				print: oops,
				savePDF: oops,
				getHexPDF: oops
			};
		}

		// ******************************
		// Running on Electron
		// ******************************
		var _electron, _dialog, _fs;

		var printSettings = {
			landscape: false,
			marginsType: 0,
			printBackground: false,
			printSelectionOnly: false,
			pageSize: 'A4'
		};

		_electron 	   = require('electron');
		_dialog 	   = _electron.remote.dialog;
		_fs 		   = require('fs');

		return {
			print: print,
			savePDF: savePDF,
			getHexPDF: getHexPDF
		}

		// ******************************
		// Internal methods
		// ******************************

		/**
		* Chama o dialogo de impressao na janela atual do Electron.
		*/
		function print() {
			var win = _electron.remote.getCurrentWindow();
			win.webContents.print();
		}

		/**
		* Chama o dialogo para salvar o PDF na jalena atual do Electron.
		* @param {object} options - As configuracoes das paginas do pdf.
		*/
		function savePDF(options) {
			var win = _electron.remote.getCurrentWindow(), 
				fileSettings = {
					filters: [ 
						{ name: 'Documento PDF', extensions: ['pdf'] }
					]
				};

			if (!win) {
				_dialog.showErrorBox('Erro', 'A janela não pode ser encontrada.');
				return;
			}

			if (!_fs) {
				_dialog.showErrorBox('Erro', 'File System não inicializado.');
				return;	
			}

			_dialog.showSaveDialog(win, fileSettings, function(filePath) {
				if (filePath) {
					win.webContents.printToPDF(angular.extend({ }, printSettings, options), function(err, data) {
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
		}

		/**
		* Retorna apenas os binarios do pdf.
		* @param {object} options - As configuracoes das paginas do pdf.
		*/
		function getHexPDF(options) {
			var win = _electron.remote.getCurrentWindow(),
				deferred = $q.defer();

			if (!win) {
				console.log('janela nao encontrada!');
			}

			win.webContents.printToPDF(angular.extend({ }, printSettings, options), function(err, data) {
				if (err) {
					deferred.reject(err);
				} else {
					deferred.resolve(data.toString('hex'));
				}
			});

			return deferred.promise;
		}

	}
}());