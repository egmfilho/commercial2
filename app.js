/*
 * @Author: egmfilho <egmfilho@live.com>
 * @Date:   2017-06-06 09:08:17
 * @Last Modified by: egmfilho
 * @Last Modified time: 2017-12-04 09:15:42
*/

const { app, autoUpdater, ipcMain, BrowserWindow, dialog } = require('electron');

if (require('electron-squirrel-startup')) return;

const path = require('path');
const url = require('url');
const fs = require('fs');

const appVersion = require('./package.json').version;
const platform = require('os').platform();

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
	// squirrel event handled and app will exit in 1000ms, so don't do anything else
	return;
}

let api = null;
try {
	api = require(path.join(path.dirname(app.getPath('exe')), './api')).map((a, i) => { 
		a.id = i;
		if (a.address.indexOf(a.root) == -1) 
			a.address = a.root + a.address;
		return a; 
	});
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

global.version = {
	value: appVersion
}

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

// ipcMain.on('callUpdater', (event, arg) => {
// 	let relativePath = {
// 		mac: {
// 			path: '../../../../../',
// 			file: './Atualizador-darwin-x64/Atualizador.app'
// 		},
// 		win: {
// 			path: '../',
// 			file: './Atualizador-win32-ia32/Atualizador.exe'
// 		}
// 	};

// 	let updater;
	
// 	try {
// 		if (process.platform === 'darwin') {
// 			let x = path.join(relativePath.mac.path + relativePath.mac.file);
// 			let y = path.join(app.getPath('exe'), x);
			
// 			fs.accessSync(y, fs.constants.F_OK);
// 			updater = y;
// 		} else {
// 			let x = path.join(relativePath.win.path, relativePath.win.file);
// 			let y = path.join(app.getPath('exe'), x);
			
// 			fs.accessSync(y, fs.constants.F_OK);
// 			updater = y;
// 		}
// 	} catch(e) {
// 		let defaultPath = path.join(app.getPath('exe'), process.platform === 'darwin' ? relativePath.mac.path : relativePath.win.path);
		
// 		let filePaths = dialog.showOpenDialog({
// 			title: 'Abrir atualizador',
// 			defaultPath: defaultPath,
// 			filters: [{ name: 'Aplicativo', extensions: ['app'] }],
// 			properties: ['openFile']
// 		});

// 		if (filePaths && filePaths.length) {
// 			updater = filePaths[0];
// 		}
// 	} finally {
// 		if (!!updater) {
// 			dialog.showMessageBox({
// 				title: 'Atualizador encontrado',
// 				message: 'Deseja executar o atualizador? \n' + updater,
// 				buttons: [ 'Sim', 'Não' ]
// 			}, (response) => {
// 				if (response == 0) {
// 					const cp = require('child_process');
// 					cp.exec('open ' + updater, (error, stdout, stderr) => {
// 						if (error) {
// 							dialog.showErrorBox('Erro', 'Não foi possível executar o atualizador.');
// 							return;
// 						}

// 						global.globals = { };
// 						app.quit();
// 					});
// 				}
// 			});
// 		} else {
// 			dialog.showErrorBox('Erro', 'O atualizador não pôde ser encontrado.');
// 		}
// 	}
// });

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
			zoomFactor: 1
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
	try {
		updater();
	} catch(e) {
		writeLog('Updater error.');
		writeLog(JSON.stringify(e));
	}
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

function updater() {
	writeLog('updater function called');

	var url;
	
	// Rodar o MAMP
	
	if (platform == 'darwin') {
		url = 'http://172.16.0.136:3000';
	} else if (platform == 'win32') {
		url = 'http://172.16.0.136/commercial-update-server/releases/';
		writeLog('Searching for updates on: ' + url);
	}

	autoUpdater.setFeedURL(url);

	autoUpdater.on('error', (e) => {
		writeLog('Error while trying to update');
		writeLog(JSON.stringify(e));
	});

	autoUpdater.on('checking-for-update', (e) => {
		writeLog('Checking for update...');
	});

	autoUpdater.on('update-available', (e) => {
		writeLog('Update available!');
	});

	autoUpdater.on('update-downloaded', (e) => {
		writeLog('Update downloaded!');
		autoUpdater.quitAndInstall();		
	});

	autoUpdater.checkForUpdates();
}

function handleSquirrelEvent() {
	if (process.argv.length === 1) {
		return false;
	}
	
	const ChildProcess = require('child_process');
	const path = require('path');
	
	const appFolder = path.resolve(process.execPath, '..');
	const rootAtomFolder = path.resolve(appFolder, '..');
	const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
	const exeName = path.basename(process.execPath);
	
	const spawn = function(command, args) {
		let spawnedProcess, error;
		
		try {
			spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
		} catch (error) {}
		
		return spawnedProcess;
	};
	
	const spawnUpdate = function(args) {
		return spawn(updateDotExe, args);
	};
	
	const squirrelEvent = process.argv[1];
	switch (squirrelEvent) {
		case '--squirrel-install':
		case '--squirrel-updated':
		// Optionally do things such as:
		// - Add your .exe to the PATH
		// - Write to the registry for things like file associations and
		//   explorer context menus
		
		// Install desktop and start menu shortcuts
		spawnUpdate(['--createShortcut', exeName]);

		writeLog('Squirrel after install/update event fired!');
		
		setTimeout(app.quit, 1000);
		return true;
		
		case '--squirrel-uninstall':
		// Undo anything you did in the --squirrel-install and
		// --squirrel-updated handlers
		
		// Remove desktop and start menu shortcuts
		spawnUpdate(['--removeShortcut', exeName]);
		
		setTimeout(app.quit, 1000);
		return true;
		
		case '--squirrel-obsolete':
		// This is called on the outgoing version of your app before
		// we update to the new version - it's the opposite of
		// --squirrel-updated

		writeLog('Squirrel obsolete event fired!');
		
		app.quit();
		return true;
	}
};