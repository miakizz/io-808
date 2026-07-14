require("dotenv").config();
var path = require("path");
var PugPlugin = require("pug-plugin");
var CopyPlugin = require("copy-webpack-plugin");
var babelConfig = require("./babelConfig");

var outputPath = path.join(__dirname, "dist");
var fontBaseURL = process.env.WEBFONT_BASE_URL;

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.pug"   // the pug file is now the entry point, not JS
  },
  output: {
    path: outputPath,
    publicPath: "/",
    filename: "js/[name].[contenthash:8].mjs"
  },
  optimization: {
    nodeEnv: "development"
  },
  plugins: [
    new PugPlugin({
      css: {
        filename: "css/[name].[contenthash:8].css"
      },
      data: {
        fontBaseURL,
        title: "iO-808",
        trackerURL: process.env.TRACKER_URL || null,
        trackerSiteID: process.env.TRACKER_SITE_ID || null,
        linotypeUserID: process.env.LINOTYPE_USER_ID || null
      }
    }),
    new CopyPlugin({
      patterns: [{ from: "static/**/*" }]
    })
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: PugPlugin.loader
      },
      {
        test: /\.css$/,
        use: [
          "css-loader",
          {
            loader: "postcss-loader",
            options: { postcssOptions: { plugins: [require("autoprefixer")] } }
          }
        ]
        // no `type` or `generator` fields — PugPlugin's css.filename above handles output naming
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: { include: path.join(__dirname, "src"), ...babelConfig(true) }
          }
        ]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
        type: "asset",
        parser: { dataUrlCondition: { maxSize: 8192 } }
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: "asset/resource"
      }
    ]
  },
  devServer: {
    static: { directory: outputPath, publicPath: "/" },
    hot: false,
    liveReload: true,
    host: "0.0.0.0",
    port: 3000,
    historyApiFallback: true
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".json"]
  },
  watch: true
};
