const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const {EsbuildPlugin} = require("esbuild-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

module.exports = (env, argv) => {
    const isPro = argv.mode === "production"
    const plugins = [
        new MiniCssExtractPlugin({
            filename: isPro ? "dist/index.css" : "index.css",
        })
    ]
    let entry = {
        "index": "./src/index.ts",
    }
    if (isPro) {
        entry = {
            "dist/index": "./src/index.ts",
        }
        plugins.push(new webpack.BannerPlugin({
            banner: () => {
                return fs.readFileSync("LICENSE").toString();
            },
        }))
        plugins.push(new CopyPlugin({
            patterns: [
                {from: "preview.png", to: "./dist/preview.png"},
                {from: "icon.png", to: "./dist/icon.png"},
                {from: "README.md", to: "./dist/README.md"},
                {from: "plugin.json", to: "./dist/plugin.json"},
            ],
        }))
        plugins.push(new ZipPlugin({
            filename: "package.zip",
            algorithm: "gzip",
            include: [/dist/],
            pathMapper: (assetPath) => {
                return assetPath.replace("dist/", "")
            },
        }))
    }
    return {
        mode: argv.mode || "development",
        watch: !isPro,
        devtool: isPro ? false : "eval",
        output: {
            filename: "[name].js",
            libraryTarget: "commonjs",
            path: path.resolve(__dirname),
        },
        externals: {
            siyuan: "siyuan",
        },
        entry,
        optimization: {
            minimize: true,
            minimizer: [
                new EsbuildPlugin({target: "es6"}),
            ],
        },
        resolve: {
            alias: {
                svelte: path.resolve('node_modules', 'svelte')
            },
            extensions: [".ts", ".scss", ".svelte"],
            mainFields: ['svelte', 'browser', 'module', 'main'],
            conditionNames: ['svelte'], // 添加此项
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                target: "es6",
                            }
                        },
                    ],
                },
                {
                    test: /\.svelte$/,
                    // include: [path.resolve(__dirname, "src")],
                    use: [
                        {
                            loader: 'svelte-loader',
                        },
                    ],
                },
                {
                  // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
                  test: /node_modules\/svelte\/.*\.mjs$/,
                  resolve: {
                    fullySpecified: false
                  }
                },
                {
                    test: /\.scss$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader", // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader", // compiles Sass to CSS
                        },
                    ],
                }
            ],
        },
        plugins,
    };
};
