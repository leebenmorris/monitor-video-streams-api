const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/frontend/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/frontend/index.html',
        }),
        new webpack.EnvironmentPlugin({
            SOCKET_URL: 'http://localhost:7080',
        }),
        new webpack.HashedModuleIdsPlugin(),
        new CleanWebpackPlugin(),
    ],
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: '[name].[contenthash].js',
    },
    // from here: https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/,
                        )[1];

                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
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
    devServer: {
        open: true,
        port: 7090,
    },
};
