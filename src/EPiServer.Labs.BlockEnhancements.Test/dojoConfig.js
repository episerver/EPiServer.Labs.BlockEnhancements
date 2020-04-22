var testFiles = [];
var testFileRegex = /_specs\.js$/;
Object.keys(window.__karma__.files).forEach(function (file) {
    if (testFileRegex.test(file)) {
        testFiles.push(file);
    }
});

/* exported dojoConfig */
var dojoConfig = {
    async: true,
    locale: "en",
    aliases: [
        ["epi/i18n", "mocks/i18n"]
    ],
    has: {
        "dojo-undef-api": true
    },
    packages: [
        { name: "dojo", location: "/base/out/dtk/dojo" },
        { name: "dijit", location: "/base/out/dtk/dijit" },
        { name: "dgrid", location: "/base/out/dtk/dgrid" },
        { name: "dojox", location: "/base/out/dtk/dojox" },
        { name: "xstyle", location: "/base/out/dtk/xstyle" },
        { name: "put-selector", location: "/base/out/dtk/put-selector" },
        { name: "epi", location: "/base/out/dtk/epi" },
        { name: "epi-cms", location: "/base/out/dtk/epi-cms" },
        { name: "episerver-telemetry-ui", location: "/base/src/alloy/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts" },
        { name: "episerver-labs-block-enhancements", location: "/base/src/alloy/modules/_protected/episerver-labs-block-enhancements/1.0.0/Scripts" },        
        { name: "mocks", location: "/base/src/EPiServer.Labs.BlockEnhancements.Test/Mocks" },
        { name: "tdd", location: "/base/src/EPiServer.Labs.BlockEnhancements.Test/tdd"}
    ]
};


/**
 * This function must be defined and is called back by the dojo adapter
 * @returns {string} a list of dojo spec/test modules to register with your testing framework
 */
window.__karma__.dojoStart = function () {
    return testFiles;
};
