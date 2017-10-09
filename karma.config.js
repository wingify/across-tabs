var path = require('path');

module.exports = function (config) {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // list of files / patterns to exclude
    exclude: [],
    browsers: [ 'PhantomJS' ],
    files: [
      'tests/**/*.spec.js',
    ],
    frameworks: [ 'jasmine' ],
    preprocessors: {
      'tests/**/*.spec.js': [ 'webpack' ]
    },
    reporters: [ 'progress', 'coverage' ],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        // reporters not supporting the `file` property
        // { type: 'html', subdir: 'report-html' }, // fro dev
        { type: 'lcov', subdir: 'report-lcov' }, // for coveralls
      ]
    },
    webpack: {
      cache: true,
      module: {
        loaders: [{
          test: /(\.js)$/,
          loader: 'babel-loader',
          exclude: /(node_modules)/,
          query: {
            presets: ['env']
          }
        }, {
          test: /\.spec.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          query: {
            cacheDirectory: true,
            presets: ['env']
          },
        }, {// transpile and instrument only testing sources with isparta
          test: /\.js$/,
          include: path.resolve('src/'),
          exclude: /(src\/vendor\/)/,
          loader: 'isparta-loader'
        }],
      },
    },
    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,
    browserNoActivityTimeout: 200000,
    browserDisconnectTolerance: 5
  });
};
