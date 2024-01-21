'use strict';

const path = require('path');
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    'service-worker': ['./src/service-worker.ts'],
    'content-script': ['./src/content-script.ts'],
    injected: ['./src/injected.ts'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app/scripts'),
  },
  module: {
    rules: [
      { test: /\.([cm]?ts|tsx)$/, loader: 'ts-loader' },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /codemirror\/mode\/meta/,
        loader: 'string-replace-loader',
        options: {
          search: '../lib/codemirror',
          replace: 'dummy-codemirror',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'ac-util': path.join(__dirname, 'src', 'util'),
      'dummy-codemirror': path.join(__dirname, 'src', 'shims', 'codemirror'),
    },
  },
  externals: {
    chrome: 'chrome',
  },
};
