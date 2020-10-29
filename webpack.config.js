const path = require('path');

module.exports = (env, argv) => {
  const isPrd = argv.mode === 'production';
  const mode = isPrd ? 'production' : 'development';
  
  var sourceMap = {
    devtool: "cheap-module-eval-source-map",
    plugins: []
  };
  
  var config = [{
    mode: mode,
    context: __dirname + '/src/client',
    entry: {
      'bundle.js': [
        path.resolve(__dirname, 'src/parser/shp-parser.js'),
      ]
    },
    output: {
      filename: 'shp.js',
      path: path.resolve(__dirname, 'dist'),
    },

    ...sourceMap
  }];

  return config;
};