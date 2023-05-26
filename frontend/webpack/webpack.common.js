const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectPreload = require('@principalstudio/html-webpack-inject-preload');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

module.exports = {
  entry: './src/main.tsx',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new HtmlWebpackInjectPreload({
      files: [
        {
          match: /(DLR_Logo)+.+(.png)$/,
          attributes: { as: 'image' }
        },
        {
          match: /(lk_germany_reduced)+.+(.geojson)$/,
          attributes: { as: 'fetch' }
        },
        {
          match: /(lk_germany_reduced_list)+.+(.json)$/,
          attributes: { as: 'fetch' }
        }
      ]
    }),
    new CopyPlugin({
      patterns: [
        './public/manifest.json',
        {from: './docs/changelog/changelog-en.md', to: 'locales/en'},
        {from: './docs/changelog/changelog-de.md', to: 'locales/de'},
      ],
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      exclude: ['node_modules', 'build', 'webpack'],
    }),
    new DotenvPlugin(),
  ],
  output: {
    filename: '[name].bundle.[contenthash].js',
    path: path.resolve(__dirname + '/..', 'build'),
    clean: true,
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {test: /\.tsx?$/i, use: ['ts-loader'], exclude: /node_modules/},
      {test: /\.css$/i, use: ['style-loader', 'css-loader']},
      {test: /\.scss$/i, use: ['style-loader', 'css-loader', 'sass-loader']},
      {
        test: /\.(png|jpe?g|gif|jp2|webp|svg)$/i,
        type: 'asset/resource',
        generator: {filename: 'images/[name].[hash][ext][query]'},
      },
      {
        test: /\.(json|geojson)$/i,
        type: 'asset/resource',
        generator: {filename: 'data/[name].[hash][ext][query]'},
      },
      {
        test: /locales.*\.json5$/i,
        type: 'asset/resource',
        generator: {
          filename: (pathData) => {
            const path = pathData.filename.split('/').slice(1, 3).join('/');
            return `${path}/[name].[hash][ext][query]`;
          },
        },
      },
    ],
  },
  resolve: {
    modules: ['src', 'public', 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {crypto: false},
  },
};
