/*
* @Author: egmfilho <egmfilho@live.com>
* @Date:   2017-06-06 09:08:17
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-23 09:04:10
*/

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');
const fs = require('fs');

let api = null;
try {
	api = require(path.join(path.dirname(app.getPath('exe')), './api')).map((a, i) => { a.id = i; return a; });
} catch(e) {
	api = [];
}

// Make sure logs directory exists
let logDir = path.join(path.dirname(app.getPath('exe')), './log');

function getDateString(dateSeparator, separator, timeSeparator) {
	let date = new Date();
	return ('0' + date.getDate()).slice(-2) + 
	       dateSeparator + 
		   ('0' + (date.getMonth() + 1)).slice(-2) + 
		   dateSeparator + 
		   date.getFullYear() + 
		   separator + 
		   ('0' + date.getHours()).slice(-2) + 
		   timeSeparator + 
		   ('0' + date.getMinutes()).slice(-2) + 
		   timeSeparator + 
		   ('0' + date.getSeconds()).slice(-2);
}

const logFilename = path.join(logDir, getDateString('-', 'T', '-') + '.log');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

global.globals = {
	apiList: api,
	api: api[0],
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

global.temp = {
	data: '{ }'
};

ipcMain.on('propagate-save-order', function(event, arg) {
	writeLog('Propagate save order called');
	mainWindow.webContents.send('refresh-orders', arg);
});

ipcMain.on('shutdown', function(event, arg) {
	writeLog('Kill\'em all!');

	global.isValidSession.value = false;

	for (var i = 0; i < global.children.array.length; i++) {
		global.children.array[i] && global.children.array[i].close();
	}

	global.children.array = new Array();

	mainWindow.webContents.send('shutdown', null);
});

ipcMain.on('killme', function(event, arg) {
	writeLog('Someone just asked to be killed!');
	setTimeout(function() {
		let win = null;

		global.children.array = global.children.array.filter(function(w) {
			if (w.id == arg.winId) 
				win = w;

			return w.id != arg.winId;
		});

		if (win) {
			writeLog('Killing window: ' + win.id);
			win.close();
		}

	}, arg.ttl || 500);
});

ipcMain.on('redeem', function(event, arg) {
	if (arg.guid) {
		writeLog('redeem fired by: ' + arg.guid);
		order66(arg.guid);
	}
});

ipcMain.on('writeLog', function(event, arg) {
	if (arg.log) {
		writeLog(arg.log);
	}
});

function writeLog(log) {
	if (!log) return;

	console.log(log);

	fs.appendFile(logFilename, '[' + getDateString('-', ' ', ':') + '] ' + log + '\n', function(err) {
		if (err) console.log(err);
	});
}

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

	writeLog('Order 66 in progress...');
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		writeLog('Status: ', res.statusCode);

		res.on('data', function(chunk) {
			writeLog('Response: ' + chunk);
			callback && callback();
		});
	});

	post_req.on('error', function(e) {
		writeLog('deu erro: ' + e.message );
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
		icon: './www/images/logo-icon.png',
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

function ready() {
	try {
		fs.statSync(logDir);
	} catch(e) {
		try {
			fs.mkdirSync(logDir);
		} catch(exeption) {
			electron.dialog.showMessageBox({
				type: 'error',
				title: 'Erro',
				message: 'O Commercial encontrou um problema ao tentar criar arquivos internos. Verifique as permissões de usuário na pasta do Commercial.',
				buttons: [ 'Fechar' ]
			}, (response) => {
				global.globals = { };
				app.quit();
			});
		}
	}

	writeLog('Initializing application');

	createWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ready);

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
		return;
	}

	writeLog('Closing Application');
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});