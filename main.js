// /*
// * @Author: egmfilho
// * @Date:   2017-06-06 09:08:17
// * @Last Modified by:   egmfilho
// * @Last Modified time: 2017-06-09 16:23:00
// */

const electron = require('electron');
// // const {app, BrowserWindow} = electron;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// var mainWindow;

// function createWindow() {
// 	mainWindow = new BrowserWindow({
// 		devTools: true,
// 		width: 1024,
// 		height: 768,
// 		webPreferences: {
// 			partition: 'persist:commercial'
// 		}
// 	});

// 	mainWindow.on('closed', function() {
// 		mainWindow = null;
// 	});

// 	mainWindow.loadURL('file://' + __dirname + '/www/index.html');
// }

// app.on('ready', createWindow);

// app.on('window-all-closed', function() {
// 	if (process.platform !== 'darwin') {
// 		app.quit();
// 	}
// });

// app.on('activate', function() {
// 	if (mainWindow === null) {
// 		createWindow();
// 	}
// });

app.on('ready', function() {
	var mainWindow = new BrowserWindow({
		devTools: true,
		width: 1024,
		height: 768,
		webPreferences: {
			partition: 'persist:commercial'
		}
	});

	mainWindow.loadURL('file://' + __dirname + '/index.html');
});