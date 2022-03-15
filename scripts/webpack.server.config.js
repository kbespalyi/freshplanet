const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");

module.exports = (env) => ({
  entry: "./server/index.ts",
  mode: "production",
  target: "node",
  output: {
    path: path.resolve(__dirname, "../dist/server"),
    filename: "index.js",
    libraryTarget: "commonjs2"
  },
  resolve: {
    mainFields: ["main"],
    extensions: [".ts", ".js", ".jsx"]
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel-loader"
      },
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          configFile: "tsconfig.server.json"
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: env.production === "production"
    }),
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true
    }),
    new CopyWebpackPlugin({
      patterns: [
          { from: './server/assets', to: 'assets' }
      ]
    })
  ],
  externals: [],
  node: {
    __dirname: false
  }
});
