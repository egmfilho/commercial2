/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-06 09:08:17
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-10-25 17:52:07
*/

const { app, ipcMain, BrowserWindow, dialog } = require('electron');

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

ipcMain.on('propagate-save-order', (event, arg) => {
	writeLog('Propagate save order called');
	mainWindow.webContents.send('refresh-orders', arg);
});

ipcMain.on('shutdown', (event, arg) => {
	writeLog('Kill\'em all!');

	global.isValidSession.value = false;

	for (let i = 0; i < global.children.array.length; i++) {
		global.children.array[i] && global.children.array[i].close();
	}

	global.children.array = new Array();

	mainWindow.webContents.send('shutdown', null);
});

ipcMain.on('killme', (event, arg) => {
	writeLog('Someone just asked to be killed!');
	setTimeout(function() {
		let win = null;

		global.children.array = global.children.array.filter(w => {
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

ipcMain.on('redeem', (event, arg) => {
	if (arg.guid) {
		writeLog('redeem fired by: ' + arg.guid);
		order66(arg.guid);
	}
});

ipcMain.on('writeLog', (event, arg) => {
	if (arg.log) {
		writeLog(arg.log);
	}
});

ipcMain.on('callUpdater', (event, arg) => {
	let relativePathUpdater;
	
	if (process.platform === 'darwin') {
		try {
			fs.accessSync('../../../../../Atualizador/test.app', fs.constants.F_OK);
			relativePathUpdater = '../../../../../Atualizador/test.app';
		} catch(e) {
			dialog.showOpenDialog();
		} finally {
			
		}
	} else {
		relativePathUpdater = '../Atualizador-win32-ia32/Atualizador.exe';
	}

	if (!relativePathUpdater) {
		return;
	}

	dialog.showMessageBox({
		message: 'open ' + path.join(app.getPath('exe'), relativePathUpdater),
		buttons: [ 'Sim', 'Não' ]
	}, (response) => {
		if (response == 0) {
			const cp = require('child_process');
			cp.exec('open ' + path.join(app.getPath('exe'), relativePathUpdater), (error, stdout, stderr) => {
				global.globals = { };
				app.quit();
			});
		}
	});
});

function writeLog(log) {
	if (!log) return;

	console.log(log);

	fs.appendFile(logFilename, '[' + getDateString('-', ' ', ':') + '] ' + log + '\n', err => {
		if (err) console.log(err);
	});
}

function order66(guid, callback) {
	const querystring = require('querystring');
	const http = require('http');

	let parsed = global.globals ? JSON.parse(global.globals.shared) : null,
		token = parsed ? parsed['session-token'] : null,
		host = parsed ? parsed['server-host'] : null;

	let post_options = {
		hostname: host.split('/')[2],
		path: '/commercial2.api/person_credit.php?action=order66',
		method: 'GET',
		headers: {
			'x-session-token': token + (guid ? ':' + guid : ''),
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

	writeLog('Order 66 in progress...');
	let post_req = http.request(post_options, res => {
		res.setEncoding('utf8');
		writeLog('Status: ', res.statusCode);

		res.on('data', chunk => {
			writeLog('Response: ' + chunk);
			callback && callback();
		});
	});

	post_req.on('error', e => {
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
		title: 'Commercial - Gestor de Vendas',
		icon: './www/images/logo-icon.png',
		show: false,
		webPreferences: {
			zoomFactor: 1.15
		}
	});

	global.mainWindow.instance = mainWindow;

	mainWindow.on('page-title-updated', e => {
		e.preventDefault();
	});

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/www/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('close', e => {
		let choice = dialog.showMessageBox({
			type: 'question',
			buttons: ['Sim', 'Não'],
			title: 'Confirmação',
			message: 'Deseja encerrar o Commercial?'
		});

		if (choice == 1) {
			e.preventDefault(); 
		} 
			
	});

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	mainWindow.maximize();
	mainWindow.show();
}

function ready() {
	try {
		fs.statSync(logDir);
	} catch(e) {
		try {
			fs.mkdirSync(logDir);
		} catch(exeption) {
			dialog.showMessageBox({
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
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	
	// if (process.platform !== 'darwin') {
		app.quit();
	// }
});

app.on('before-quit', (event) => {
	let parsed = global.globals ? JSON.parse(global.globals.shared) : null;

	if (parsed && parsed['session-token']) {
		order66(null, app.quit);
		global.globals = null;
		event.preventDefault();
		return;
	}

	writeLog('Closing Application');
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});