const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: "development", // 'development' for debugging, 'production' for production
  entry: {
    "service-worker": "./src/service-worker/index.ts",
    offscreen: "./src/offscreen.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "." }, // Copy manifest.json and static files
        { from: "src/offscreen.html", to: "." }, // Copy offscreen.html
      ],
    }),
  ],
  devtool: "source-map", // Helps with debugging
  watchOptions: {
    ignored: /node_modules/,
  },
};
