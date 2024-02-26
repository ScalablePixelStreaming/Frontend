const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config({ path: './.env' });

module.exports = {
    entry: {
        index: './src/index.ts',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Scalable Pixel Streaming Frontend',
            template: './src/index.html',
            filename: 'index.html'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [
                    /node_modules/,
                ],
            },
            {
                test: /\.html$/i,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]'
                }
            },
            {
                test: /\.(png|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext]'
                }
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.svg'],
    },
    output: {
        filename: '[name].js',
        library: 'spstypescriptexample',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        globalObject: 'this',
        hashFunction: 'xxhash64'
    },
    experiments: {
        futureDefaults: true
    },
    optimization: {
        minimize: false
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
    },
};