const path = require('path');

module.exports = {
  entry: './static/src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static', 'dist'),
  },
  mode: 'development',
  devtool: 'inline-source-map',
};
