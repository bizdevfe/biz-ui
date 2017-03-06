var gulp = require('gulp');
var jshint = require('gulp-jshint');
var prettify = require('gulp-jsbeautifier');
var pure = require('gulp-pure-cjs');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var clean = require('gulp-clean-css');
var rename = require("gulp-rename");
var jsdoc = require('gulp-jsdoc3');
var sequence = require('gulp-sequence');

gulp.task('lint', function() {
    return gulp.src(['src/*.js', 'src/ui/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));
});

gulp.task('prettify', function() {
    return gulp.src(['src/*.js', 'src/*/*.js', 'src/css/*.less'], {base: './'})
      .pipe(prettify({
          indent_size: 4
      }))
      .pipe(gulp.dest('./'));
});

gulp.task('merge-js', function() {
    return gulp.src('src/bizui.js')
        .pipe(pure({
            external: {
                jquery: {
                    amd: 'jquery',
                    global: 'jQuery'
                }
            },
            exports: 'bizui'
        }))
        .pipe(rename('jquery.bizui.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-js', function() {
    return gulp.src('dist/jquery.bizui.js')
        .pipe(uglify())
        .pipe(rename('jquery.bizui.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('merge-css', function() {
    return gulp.src('src/css/bizui.less')
        .pipe(less())
        .pipe(rename('jquery.bizui.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function() {
    return gulp.src('dist/jquery.bizui.css')
        .pipe(clean())
        .pipe(rename('jquery.bizui.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-js', sequence('merge-js', 'minify-js'));
gulp.task('build-css', sequence('merge-css', 'minify-css'));
gulp.task('build', sequence('lint', 'prettify', ['build-js', 'build-css']));

gulp.task('doc', function(cb) {
    var files = [
        'README.md',
        'src/bizui.js',
        'src/ui/Button.js',
        'src/ui/Calendar.js',
        'src/ui/Checkbox.js',
        'src/ui/Dialog.js',
        'src/ui/DropDown.js',
        'src/ui/Input.js',
        'src/ui/Page.js',
        'src/ui/Panel.js',
        'src/ui/Radio.js',
        'src/ui/Select.js',
        'src/ui/Tab.js',
        'src/ui/Table.js',
        'src/ui/Textarea.js',
        'src/ui/Textline.js',
        'src/ui/Tooltip.js',
        'src/ui/Transfer.js',
        'src/ui/Tree.js',
        'src/ui/TreeTable.js'
    ];
    gulp.src(files, {read: false})
        .pipe(jsdoc({
            opts: {
                destination: 'docs'
            },
            templates: {
                theme: "cerulean"
            }
        }, cb));
});
