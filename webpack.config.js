// vim: ts=2 sts=2 sw=2
//
const path = require('path')
const webpack = require('webpack')

const AssetsPlugin = require('assets-webpack-plugin')

module.exports = (options) => {
  return {
    entry: {
      app: './resource/js/app'
    },
    output: {
      path: path.join(__dirname, './public/js'),
      publicPath: '/js/',
      filename: '[name].bundle.js',
      sourceMapFilename: '[name].bundle.map',
      chunkFilename: '[id].chunk.js',
    },
    // resolve: {
    //   extensions: ['.js'],
    //   modules: [path.resolve(__dirname, 'resource/js'), 'node_modules']
    // },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.scss/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                includePaths: require('bourbon').includePaths,
              }
            }
          ]
        },
        {
          test: /\.(png|git|jpe?g)$/,
          use: ['file-loader']
        }
      ]
    },
    plugins: [
      new AssetsPlugin({
        path: './public/js',
        prettyPring: true,
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
        }
      })
    ],
  }
}
