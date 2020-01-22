const path = require("path");

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production";
    return {
        devtool: isProduction ? "source-map" : "inline-source-map",
        entry: "./src/tracker.js",
        output: {
            filename: "tracker.js",
            libraryTarget: "amd",
            libraryExport: "default",
            path: path.resolve(__dirname, "./../alloy/modules/_protected/episerver-labs-block-enhancements/1.0.0/Scripts")
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: isProduction ? ["babel-plugin-transform-remove-console"] : []
                        }
                    }
                }
            ]
        }
    }
}
