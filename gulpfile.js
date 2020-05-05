const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const istanbul = require('gulp-istanbul');

gulp.task('pre-test', function () {
  return gulp.src(['lib/**/*.js'])
  // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', gulp.series('pre-test', function () {
  return gulp.src(['spec/*.js'])
    .pipe(jasmine())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports({
      reporters: [ 'lcov', 'html', 'text', 'text-summary' ],
    }))
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 95 } }));
}));
