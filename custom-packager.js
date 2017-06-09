/*
* @Author: egmfilho
* @Date:   2017-06-09 14:15:02
* @Last Modified by:   egmfilho
* @Last Modified time: 2017-06-09 14:27:33
*/

const packager = require('electron-packager');

var options = {
	dir: './',
	arch: 'x64',
	icon: './commercial.icns',
	name: 'Commercial',
	out: './build',
	ignore: [
		'/app',
		'./bower_components',
		'./node_modules',
		'./.gitignore',
		'./bower.json',
		'./Diagrama.asta',
		'./gulpfile.js'
	]
};

packager.options(options).then(function(appPaths) {
	console('done! :)');
}, function(err) {
	console.log(err);
});