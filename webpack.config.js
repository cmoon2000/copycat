const path = require("path");
const glob = require("glob");

const files = glob.sync("./src/**/*.ts");

module.exports = {
  entry: files,
  output: {
    path: path.resolve(__dirname, "dist", "scripts"),
    filename: 'app.bundle.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts']
  },
  module: {
    loaders: [{
      test: /\.ts$/,
      loader: "awesome-typescript-loader"
    }]
  }
}