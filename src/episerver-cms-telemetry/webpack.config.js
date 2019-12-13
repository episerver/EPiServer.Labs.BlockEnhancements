const path = require("path");

module.exports = (env, argv) => {
    return {
        devtool: argv.mode === "production" ? "source-map" : "inline-source-map",
        resolve: {
            extensions: [".js"]
        },
        entry: "./src/tracker.js",
        output: {
            filename: "tracker.js",
            libraryTarget: "amd",
            libraryExport: "default",
            path: path.resolve(__dirname, "dist")
        }
    }
}
