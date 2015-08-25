var gulp = require('gulp');
var browserSync = require('browser-sync').create();

var game = '';

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./examples/" + game
        }
    });
});

gulp.task('setMines', function(){
  game = 'mines/';
});

gulp.task('mines', ['setMines', 'browser-sync'])

gulp.task('default', ['browser-sync']);
