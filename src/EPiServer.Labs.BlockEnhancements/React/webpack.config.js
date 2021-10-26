const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
    const webpackCommon = require("./webpack.common")(env, argv);

    return {
        ...webpackCommon,
        entry: "./index.tsx",
        output: {
            filename: `blockenhancements-labs.bundle.js${argv.outputPostfix || ""}`,
            path: path.resolve(__dirname, '../ClientResources/dist'),
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'blockenhancements-labs.bundle.css'
            }),
            new BundleAnalyzerPlugin({analyzerMode: "disabled"})
        ]
    };
};
