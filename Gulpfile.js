'use strict';

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	eslint = require('gulp-eslint'),
	david = require('gulp-david'),
	paths = [ './index.js' ];

gulp.task('jshint', () => {
	return gulp.src(paths)
		.pipe(jshint())
		.pipe(jshint.reporter('default', { verbose: true }))
		.pipe(jshint.reporter('fail'));
});

gulp.task('eslint', () => {
	return gulp.src(paths)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('david', () => {
	gulp.src('package.json')
		.pipe(david())
		.on('error', () => this.emit('end'));
});

gulp.task('test', ['david', 'jshint', 'eslint']);
