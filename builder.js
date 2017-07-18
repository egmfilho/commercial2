/*
* @Author: egmfilho
* @Date:   2017-06-09 14:15:02
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-07-18 17:52:38
*/

const packager = require('electron-packager');
const path     = require('path');

let platform = process.argv.slice(2)[0];
let icon     = path.join(__dirname, platform == 'win32' ? 'commercial.ico' : 'commercial.icns');

let options = {
	'dir': __dirname,
	'asar': true,
	'arch': 'x64',
	'platform': platform,
	'icon': icon,
	'name': 'Commercial',
	'out': path.join(__dirname, 'releases'),
	'overwrite': true,
	'version-string': {
		'CompanyName': 'Futura Agência',
		'FileDescription': 'Commercial - Gestor de vendas',
		'OriginalFilename': 'Commercial2',
		'ProductName': 'Commercial',
		'InternalName': 'Commercial2'
	},
	'ignore': [
		'app/',
		'bower_components/',
		'node_modules/gulp*',
		'releases/',
		'.gitignore',
		'bower.json',
		'builder.js',
		'commercial.icns',
		'commercial.ico',
		'Diagrama.asta',
		'gulpfile.js',
		'README.md'
	]
};

console.log('>>> Starting Electron Packager proccess...');
packager(options, (err, appPaths) => {
	if (err)
		console.log(err);
	else
		console.log('>>> Electron Packager proccess done!');
});