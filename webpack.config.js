const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/frontend/index.js',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'index_bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/frontend/index.html',
        }),
        new webpack.EnvironmentPlugin({
            SOCKET_URL: 'http://localhost:7080',
        }),
    ],
    devServer: {
        open: true,
        port: 7090,
    },
};
