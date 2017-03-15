var webpack = require('webpack');
var DashboardPlugin = require('webpack-dashboard/plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var createVariants = require('parallel-webpack').createVariants;

// Import the plugin:
var path = require('path');
var env = require('yargs').argv.mode;

var libraryName = 'across-tabs';

var libVersion = JSON.stringify(require("./package.json").version);

var libraryHeaderComment =  '\n' +
  'across-tabs ' + libVersion + '\n' +
  'https://github.com/wingify/across-tabs.js\n' +
  'MIT licensed\n' +
  '\n' +
  'Copyright (C) 2017-2018 Wingify - A project by Varun Malhotra(https://github.com/softvar)\n';


var plugins = [
  new webpack.BannerPlugin(libraryHeaderComment, { entryOnly: true })
];
var outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
} else {
  plugins.push(new DashboardPlugin());
}

function createConfig(options) {
  return {
    entry: __dirname + '/src/index.js',
    devtool: 'source-map',
    output: {
      path: __dirname + '/dist',
      library: 'AcrossTabs',
      filename: libraryName + (options.target ? '.' + options.target : '') + (env === 'build' ? '.min.js' : '.js'),
      libraryTarget: options.target || 'umd',
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
}

// At the end of the file:
module.exports = createVariants({
    target: ['this', '']
}, createConfig);
