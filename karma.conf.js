/* eslint-env commonjs */
module.exports = function (config) {
    config.set({
        browsers: ["ChromeHeadless"],
        customLaunchers: {
            DebuggableHeadless: {
                base: "ChromeHeadless",
                flags: ["--disable-translate", "--disable-extensions", "--remote-debugging-port=9223"]
            }
        },
        files: [
            "src/EPiServer.Labs.BlockEnhancements.Test/dojoConfig.js",
            { pattern: "src/EPiServer.Labs.BlockEnhancements.Test/**/*.js", included: false, watched: true },
            // Load all files to be tested but don't include them since they will be loaded dynamically.                        
            { pattern: "out/dtk/**/*.css", included: false, watched: false },
            { pattern: "out/dtk/**/*.js", included: false, watched: false },
            { pattern: "out/dtk/**/*.html", included: false, watched: false },
            { pattern: "out/dtk/**/*.gif", included: false, watched: false },
            { pattern: "src/alloy/modules/_protected/episerver-labs-block-enhancements/1.0.0/Scripts/**/*.js", included: false, watched: true}                        
        ],
        frameworks: ["dojo", "mocha", "chai-as-promised", "chai-sinon", "chai"],
        reporters: ["mocha"],
        client: {
            mocha: {
                // change Karma's debug.html to the mocha web reporter
                reporter: "html",
                grep: config.grep,
                ignoreLeaks: true // Tiny seems to leak "mce-data-1c5oo1d1t, tinymce, tinyMCE"
            }
        },
        singleRun: false,        

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            "src/alloy/modules/_protected/episerver-labs-block-enhancements/1.0.0/Scripts/**/*.js": ["coverage"]
        },

        // optionally, configure the reporter
        coverageReporter: {
            dir: "out/coverage/",
            instrumenterOptions: {
                istanbul: { noCompact: true }
            },
            reporters: [
                { type: "html", subdir: "html-report" },
                { type: "lcov", subdir: "lcov-report"}
            ]
        }
    });
};

