const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/App.tsx',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyPlugin({
      patterns: ['./public/manifest.json', {from: './public/assets', to: 'assets'}],
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      exclude: ['node_modules', 'build', 'webpack'],
    }),
  ],
  output: {
    path: path.resolve(__dirname + '/..', 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {test: /\.tsx?$/i, use: ['ts-loader'], exclude: /node_modules/},
      {test: /\.css$/i, use: ['style-loader', 'css-loader']},
      {test: /\.scss$/i, use: ['style-loader', 'css-loader', 'sass-loader']},
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, '..', 'src'), 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};
