import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { join } from "node:path";
import "webpack-dev-server";

const BUILD_DIR = join(__dirname, "dist");

const config: webpack.Configuration = {
  entry: {
    script: "./src/index.ts",
    css: "./css/index.scss",
  },
  output: {
    path: BUILD_DIR,
    filename: "[name].bundle.js",
    clean: true,
  },
  module: {
    rules: [
      { test: /\.txt$/, use: "raw-loader" },
      { test: /\.tsx?$/, use: "ts-loader", exclude: "/node_modules/" },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  devServer: {
    static: BUILD_DIR,
    port: 80,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [new HtmlWebpackPlugin({ title: "shader runner" })],
};

export default config;
