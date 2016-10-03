/* jshint esversion: 6, strict: false */

const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');

const srcFiles = ['js/**/*.js', 'spec/**/*.js', './*.js'];

gulp.task('jscs', () => {
  return gulp.src(srcFiles).pipe(jscs()).pipe(jscs.reporter()).pipe(jscs.reporter('fail'));
});

gulp.task('jshint', () => {
  return gulp.src(srcFiles).pipe(jshint()).pipe(jshint.reporter('jshint-stylish')).pipe(jshint.reporter('fail'));
});

gulp.task('lint', ['jscs', 'jshint']);
