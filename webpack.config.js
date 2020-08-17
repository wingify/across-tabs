var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var createVariants = require('parallel-webpack').createVariants;

// Import the plugin:
var argv = require('yargs').argv.env;
var env = argv.mode;

console.warn(env);

var libraryName = 'across-tabs';

var libVersion = JSON.stringify(require('./package.json').version);

var libraryHeaderComment =
  '\n' +
  'across-tabs ' +
  libVersion +
  '\n' +
  'https://github.com/wingify/across-tabs\n' +
  'MIT licensed\n' +
  '\n' +
  'Copyright (C) 2017-2019 Wingify Pvt. Ltd. - Authored by Varun Malhotra(https://github.com/softvar)\n';

var plugins = [
  new webpack.BannerPlugin({
    banner: libraryHeaderComment,
    entryOnly: true
  })
];

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
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
      rules: [
        {
          test: /(\.js)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            // babel-loader to convert ES6 code to ES5 + amdCleaning requirejs code into simple JS code, taking care of modules to load as desired
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: []
            }
          }
        },
        {
          enforce: 'pre',
          test: /(\.js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'eslint-loader',
            options: {
              fix: true,
              emitError: true,
              emitWarning: true,
              failOnWarning: env === 'build',
              failOnError: env === 'build'
            }
          }
        }
      ]
    },
    plugins: plugins
  };
}

// At the end of the file:
module.exports = createVariants(
  {
    target: ['this', '']
  },
  createConfig
);
