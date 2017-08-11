/*
* @Author: egmfilho
* @Date:   2017-06-06 09:08:17
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-08-11 13:32:54
*/

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

global.globals = {
	shared: '{ }'
};

global.children = {
	array: new Array()
};

global.isValidSession = {
	value: false
};

global.mainWindow = {
	instance: null
};

ipcMain.on('propagate-save-order', function(event, arg) {
	mainWindow.webContents.send('refresh-orders', arg);
});

ipcMain.on('shutdown', function(event, arg) {
	console.log('Kill\'em all!');

	global.isValidSession.value = false;

	for (var i = 0; i < global.children.array.length; i++) {
		global.children.array[i] && global.children.array[i].close();
	}

	global.children.array = new Array();

	mainWindow.webContents.send('shutdown', null);
});

ipcMain.on('redeem', function(event, arg) {
	if (arg.guid) {
		console.log('redeem fired by: ' + arg.guid);
		order66(arg.guid);
	}
});

function order66(guid, callback) {
	var parsed = global.globals ? JSON.parse(global.globals.shared) : null,
		token = parsed ? parsed['session-token'] : null,
		host = parsed ? parsed['server-host'] : null;

	var querystring = require('querystring'),
		http = require('http');

	var post_options = {
		hostname: host.split('/')[2],
		path: '/commercial2.api/person_credit.php?action=order66',
		method: 'GET',
		headers: {
			'x-session-token': token + (guid ? ':' + guid : ''),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	console.log('Order 66 in progress...');
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		console.log('Status: ', res.statusCode);

		res.on('data', function(chunk) {
			console.log('Response: ' + chunk);
			callback && callback();
		});
	});

	post_req.on('error', function(e) {
		console.log('deu erro: ' + e.message );
		callback && callback();
	});

	post_req.end();
}

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1024, 
		height: 768,
		devTools: false,
		title: 'Commercial - Gestor de vendas',
		webPreferences: {
			zoomFactor: 1.15
		}
	});

	global.mainWindow.instance = mainWindow;

	mainWindow.maximize();

	mainWindow.on('page-title-updated', function(e) {
		e.preventDefault();
	});

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/www/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('close', function(e) {
		var choice = electron.dialog.showMessageBox(this, {
			type: 'question',
			buttons: ['Sim', 'Não'],
			title: 'Confirmação',
			message: 'Deseja encerrar o Commercial?'
		});

		if (choice != 1) {

		} else {
			e.preventDefault(); 
		} 
			
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	
	// if (process.platform !== 'darwin') {
		app.quit();
	// }
});

app.on('before-quit', function (event) {
	var parsed = global.globals ? JSON.parse(global.globals.shared) : null;

	if (parsed && parsed['session-token']) {
		order66(null, app.quit);
		global.globals = null;
		event.preventDefault();
	}
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});