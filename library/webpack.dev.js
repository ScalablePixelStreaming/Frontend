const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const devCommon = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: './dist',
  }
};

module.exports = [
  merge(common, devCommon, {
    output: {
      filename: 'libspsfrontend.js',
      library: {
        name: 'libspsfrontend', // exposed variable that will provide access to the library classes
        type: 'umd'
      },
    },
  }),
  merge(common, devCommon, {
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
