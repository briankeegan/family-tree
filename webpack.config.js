const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'docs/js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      }
    ]
    //   loaders: [
    //     { exclude: ['node_modules'], loader: 'babel', test: /\.jsx?$/ },
    //     { loader: 'style-loader!css-loader', test: /\.css$/ },
    //     { loader: 'url-loader', test: /\.gif$/ },
    //     { loader: 'file-loader', test: /\.(ttf|eot|svg)$/ }
    //   ]
    // },
    // resolve: {
    //   alias: {
    //     config$: './configs/app-config.js',
    //     react: './vendor/react-master'
    //   },
    //   extensions: ['', 'js', 'jsx'],
    //   modules: [
    //     'node_modules',
    //     'bower_components',
    //     'shared',
    //     '/shared/vendor/modules'
    //   ]
  },
  resolve: {
    modules: [path.resolve(__dirname, './'), 'node_modules']
  }
}
