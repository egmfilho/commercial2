/*
* @Author: egmfilho
* @Date:   2017-06-06 09:08:17
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 08:28:43
*/

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

global.globals = {
	shared: '{ }'
};

function postCloseEvent(token, host) {
	var querystring = require('querystring'),
		http = require('http');

	var post_data = querystring.stringify({
		'person_id': '00A000002S'
	});

	var post_options = {
		hostname: host,
		path: '/commercial2.api/person_credit.php?action=getList',
		method: 'POST',
		headers: {
			'x-session-token': token,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data)
		}
	};

	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		console.log('Status: ', res.statusCode);
		res.on('data', function(chunk) {
			console.log('Response: ' + chunk);
		});
	});

	post_req.on('error', function(e) {
		console.log('deu erro: ' + e.message );
	});

	post_req.write(post_data);
	post_req.end();


}

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1024, 
		height: 768,
		devTools: false
	});

	mainWindow.maximize();

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/www/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;

		var parsed = JSON.parse(global.globals.shared),
			token = parsed['session-token'],
			host = parsed['server-host'];

		if (token)
			postCloseEvent(token, host);
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
	
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
})