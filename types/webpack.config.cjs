const path = require('path');

module.exports = {
  entry: './index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'index.cjs',
    path: path.resolve(__dirname, './'),
  },
};