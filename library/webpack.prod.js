const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const prodCommon = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true
  },
  stats: 'errors-only',
};

module.exports = [
  merge(common, prodCommon, {
    output: {
      filename: 'libspsfrontend.min.js',
      library: {
        name: 'libspsfrontend', // exposed variable that will provide access to the library classes
        type: 'umd'
      },
    },
  }),
  merge(common, prodCommon, {
    output: {
      filename: 'libspsfrontend.esm.js',
      library: {
        type: 'module'
      },
    },
    experiments: {
      outputModule: true
    }
  })
];
