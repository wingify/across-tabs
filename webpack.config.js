var webpack = require('webpack');
var DashboardPlugin = require('webpack-dashboard/plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
// Import the plugin:
var path = require('path');
var env = require('yargs').argv.mode;

var libraryName = 'across-tabs';

var plugins = [
  new DashboardPlugin()
];
var outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

var config = {
  entry: __dirname + '/src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    library: 'AcrossTabs',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  eslint: {
    failOnWarning: false,
    failOnError: false
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins: plugins
};

module.exports = config;
