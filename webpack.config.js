const fs = require("fs");
const path = require("path");
const Dotenv = require("dotenv-webpack");

const extensions = fs.readdirSync("./src/entries/");
const entry = Object.fromEntries(
  extensions.map((e) => [e.substring(0, e.length - 3), `./src/entries/${e}`])
);

module.exports = {
  entry,
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
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
    new Dotenv({
      path: ".env.local",
      systemvars: true,
    }),
  ],
};
