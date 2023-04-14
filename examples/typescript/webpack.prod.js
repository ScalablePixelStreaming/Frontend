const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
      usedExports: true,
      minimize: true
    },
    stats: 'errors-only',
	performance: {
		hints: false
	}
});
