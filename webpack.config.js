const path = require('path');

module.exports = {
  // mode: 'production',
  entry: './src/lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'DataReport'
  }
}