var electronInstaller = require('electron-winstaller');

electronInstaller.createWindowsInstaller({
	appDirectory: './releases/Commercial-win32-x64',
	outputDirectory: './releases/winstaller/Winstaller-win32-x64',
	authors: 'Futura Agência',
	exe: 'Commercial.exe',
	setupExe: 'Instalador_Commercial.exe',
	noMsi: false,
	setupMsi: 'Instalador_Commercial.msi',
	setupIcon: './commercial.ico'
	// certificateFile: '/Users/egmfilho/Desktop/certificado/mycert.pfx',
	// certificatePassword: 'futur@2017'
}).then(() => {
	console.log('Winstaller done!');
}, (e) => {
	console.log(e.message);
});