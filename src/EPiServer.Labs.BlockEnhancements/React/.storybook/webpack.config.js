module.exports = async ({config}) => {
    const webpackCommon = require("../webpack.common.js")(config, {});

    config.module.rules = [
        ...(config.resolve.rules || []),
        ...webpackCommon.module.rules
    ];
    config.resolve = Object.assign({}, config.resolve, webpackCommon.resolve);
    config.resolve.extensions.push('.ts', '.tsx');

    return config;
};
