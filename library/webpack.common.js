const package = require('./package.json');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [/node_modules/]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [],
    output: {
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this'
    }
};