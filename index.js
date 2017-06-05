const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron;

ipcMain.on('document-ready-to-print', function(e, a) {
	console.log('readyToPrint', a);
	e.sender.send('can-print', '');
});

app.on('ready', function() {
	var mainWindow = new BrowserWindow({
		devTools: true,
		width: 1024,
		height: 768,
		webPreferences: {
			partition: 'persist:commercial'
		}
	});

	// mainWindow.webContents.session.cookies.set({
	// 	url: 'https://myapp.com',
	// 	name: 'teste_cookie',
	// 	value: 'teste_value',
	// 	domain: 'myapp.com'
	// }, function(error) {
		
	// 	mainWindow.webContents.session.cookies.get({}, function(error, cookies) {
	// 		console.log(cookies);
	// 	});

	// });

	mainWindow.loadURL('file://' + __dirname + '/www/index.html');
});