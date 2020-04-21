const path = require("path");

module.exports = () => {
    return [
        {
            devtool: "source-map",
            mode: "production",
            entry: "./src/tracker.js",
            output: {
                filename: "tracker.js",
                libraryTarget: "amd",
                libraryExport: "default",
                path: path.resolve(__dirname, "./../alloy/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts")
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
                                plugins: ["babel-plugin-transform-remove-console"]
                            }
                        }
                    }
                ]
            }
        },
        {
            devtool: "inline-source-map",
            mode: "development",
            entry: "./src/tracker.js",
            output: {
                filename: "tracker.js.uncompressed.js",
                libraryTarget: "amd",
                libraryExport: "default",
                path: path.resolve(__dirname, "./../alloy/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts")
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["@babel/preset-env"]
                            }
                        }
                    }
                ]
            }
        }
    ]
}
