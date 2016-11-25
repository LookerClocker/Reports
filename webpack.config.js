var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'App.js'),
    output: {
        filename: 'App.js',
        path: path.resolve(__dirname, 'build/build'),
        publicPath: path.resolve(__dirname, 'public/build')
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    node: {
        fs: "empty"
    },

    devServer: {
        historyApiFallback: true,
        contentBase: './',
        hot: true
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ["es2015", "stage-0", "react"]
                }

            },

            {
                test: /\.html$/,
                loader: "html"
            },

            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },

            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
                loader: 'url-loader?limit=10000'
            },

            {
                test: /\.(eot|ttf|wav|mp3)$/,
                loader: 'file-loader'
            }
        ]
    }
};