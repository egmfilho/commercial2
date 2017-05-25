const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready', function() {
	var mainWindow = new BrowserWindow({
		width: 1024,
		height: 768
	});

	mainWindow.loadURL('file://' + __dirname + '/www/index.html');
});