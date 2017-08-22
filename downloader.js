const http = require('http');
const url  = require('url');
const fs   = require('fs');

var dlStatus = {
	progress: 0,
	total: 0,
	isDownloading: false
};

function download(rawUrl, file, progress, callback) {
	var parsedUrl = url.parse(rawUrl);
	var host      = parsedUrl.hostname;
	var path      = parsedUrl.pathname;
	var filename  = file || path.split('/').pop();

	setInterval(function() {
		if (dlStatus.isDownloading)
			console.log(`Download progress:  ${ (dlStatus.progress / 1000000).toFixed(2) }Mb`);
	}, 100);

	var options = {
		method: 'GET',
		host: host,
		path: path,
		port: 80
	};

	var req = http.request(options, function(res) {
		if (res.statusCode !== 200) return;

		var f = fs.createWriteStream(filename, { 'flags': 'w' });

		dlStatus.progress = 0;
		dlStatus.total = res.headers['content-length'];
		console.log(`File size: ${ (dlStatus.total / 1000000).toFixed(2) }Mb`);

		res.on('data', function(chunk) {
			dlStatus.isDownloading = true;
			f.write(chunk, encoding='binary');
			dlStatus.progress += chunk.length;
			progress && progress(dlStatus);
		});

		res.on('end', function() {
			dlStatus.isDownloading = false;
			progress && progress(dlStatus);
			f.end();
			console.log('Download complete!');
			callback && callback();
		});
	});

	req.on('error', function(e) {
		console.error(`problem with request: ${e.message}`);
	});

	req.end();
}

module.exports = {
	download: function(options, progress, callback) {
		return download(options.url, options.filename, progress, callback);
	},

	downloadStatus: function() {
		return dlStatus;
	}
};