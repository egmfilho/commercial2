const electron = require('electron');
const {app, BrowserWindow} = electron;

app.on('ready', function() {
	var mainWindow = new BrowserWindow({
		devTools: true,
		width: 1024,
		height: 768,
		webPreferences: {
			partition: 'persist:commercial'
		}
	});

	mainWindow.loadURL('file://' + __dirname + '/www/index.html');
});