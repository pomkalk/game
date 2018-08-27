var path = require('path')

module.exports = {
  mode: 'development',
  entry: './server.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'server.js'
  },
  target: 'node'
}