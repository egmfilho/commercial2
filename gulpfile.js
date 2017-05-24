'use strict';

const gulp 	     = require('gulp');
const gutil 	 = require('gulp-util');
const connect    = require('gulp-connect');
const pug 	     = require('gulp-pug');
const sass       = require('gulp-sass');
const uglify     = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat     = require('gulp-concat');
const bower      = require('gulp-bower');
const bowerFiles = require('main-bower-files');
const cssnano    = require('gulp-cssnano');

var source = 'app/'; // removed ./ due the undetection of new/deleted files
var dest   = './www/';

function error_handler(error) {
	// Output an error message
	gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
	// emit the end event, to properly end the task
	this.emit('end');
}

gulp.task('connect', function() {
	connect.server({
		root: dest,
		port: 9000,
		livereload: 'true'
	});
});

gulp.task('index', function() {
	return gulp.src(source + 'index.pug')
		.pipe(pug({ }).on('error', error_handler))
		.pipe(gulp.dest(dest))
		.pipe(connect.reload());
});

gulp.task('compile-views', function() {
	return gulp.src(source + 'views/*.pug')
		.pipe(pug({ }).on('error', error_handler))
		.pipe(gulp.dest(dest + 'views'))
		.pipe(connect.reload());
});

gulp.task('compile-sass', function() {
	return gulp.src(source + 'styles/*.scss')
		.pipe(sass().on('error', error_handler))
		.pipe(gulp.dest(dest + 'styles'))
		.pipe(connect.reload());
});

gulp.task('bower-restore', function() {
	return bower();
});

gulp.task('vendor-bundle', ['bower-restore'], function() {
	return gulp.src(bowerFiles({ filter: '**/*.js' }))
		.pipe(sourcemaps.init())
		.pipe(concat('vendors.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest(dest + 'scripts'))
		.pipe(connect.reload());
});

gulp.task('app-bundle', function(cb) {
	return gulp.src([
			source + 'scripts/app.js',
			source + 'scripts/**/*.js'
		])
		.pipe(sourcemaps.init())
		.pipe(concat('app.min.js'))
		.pipe(uglify().on('error', error_handler))
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest(dest + 'scripts'))
		.pipe(connect.reload());
});

gulp.task("css", ["bower-restore"], function() {
	return gulp.src(bowerFiles({ filter: '**/*.css' }))
		.pipe(sourcemaps.init())
		.pipe(concat('vendor.min.css'))
		.pipe(cssnano())
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest(dest + 'styles'))
		.pipe(connect.reload());
});

gulp.task('copy-images', function() {
	return gulp.src(source + 'images/**/*.{png,gif,jpg,jpeg}')
		.pipe(gulp.dest(dest + 'images'))
		.pipe(connect.reload());
});

gulp.task('copy-fonts', function() {	
	return gulp.src([
			'./bower_components/bootstrap-sass/assets/fonts/**/*.*',
			'./bower_components/font-awesome/fonts/**/*.*',
			source + 'fonts/**/*.*'
		])
		.pipe(gulp.dest(dest + 'fonts'))
		.pipe(connect.reload());
});

gulp.task('copy-videos', function() {	
	return gulp.src(source + 'videos/**/*.{mp4,ogg,webm}')
		.pipe(gulp.dest(dest + 'videos'))
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch([source + '*.pug'], ['index']);
	gulp.watch([source + 'views/*.pug'], ['compile-views']);
	gulp.watch([source + 'templates/*.pug'], ['index', 'compile-views']);
	gulp.watch([source + 'styles/*.scss'], ['compile-sass']);
	gulp.watch([source + 'scripts/**/*.js'], ['app-bundle']);
	gulp.watch(bowerFiles({ filter: '**/*.css' }), ['css']);
	gulp.watch(bowerFiles({ filter: '**/*.js' }), ['vendor-bundle']);
	gulp.watch(bowerFiles(), ['copy-fonts']);
	gulp.watch([source + 'images/**/*.*'], ['copy-images']);
	gulp.watch([source + 'fonts/**/*.*'], ['copy-fonts']);
	gulp.watch([source + 'videos/**/*.*'], ['copy-videos']);
});

gulp.task('default', ['connect', 'watch']);

gulp.task('build', ['index', 'compile-views', 'compile-sass', 'app-bundle', 'copy-images', 'vendor-bundle', 'css', 'copy-fonts', 'copy-videos']);

