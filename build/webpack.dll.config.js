const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json')

const rootDir = path.resolve(__dirname, '../test/unit')
const buildPath = path.resolve(rootDir, 'dist')

const entry = {}
entry[pkg.dllPlugin.name] = pkg.dllPlugin.include

module.exports = {
  devtool: '#source-map',
  entry,
  output: {
    path: buildPath,
    filename: '[name].dll.js',
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(buildPath, '[name].json')
    })
  ],
  performance: {
    hints: false
  }
}
