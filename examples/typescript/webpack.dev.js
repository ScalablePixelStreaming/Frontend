const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            WEBSOCKET_URL: JSON.stringify((process.env.WEBSOCKET_URL !== undefined) ? process.env.WEBSOCKET_URL : undefined),
            ENABLE_METRICS: JSON.stringify((process.env.ENABLE_METRICS !== undefined) ? process.env.ENABLE_METRICS : false)
        }),
    ]
});
