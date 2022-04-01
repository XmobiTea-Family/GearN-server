const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                options: {
                    configFile: "tsconfig-build.json",
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "commonjs",
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        keep_fnames: true,
                        keep_classnames: true,
                    },
                    mangle: {
                        keep_fnames: true,
                        keep_classnames: true,
                    },
                },
            }),
        ],
    },
};
