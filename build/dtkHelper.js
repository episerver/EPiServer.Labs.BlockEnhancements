"use strict";

const path = require("path");
const fs = require("fs");

class DtkHelper {
    constructor(outDir, configuration) {
        this.configuration = configuration;
        this.outPath = outDir;
        this.outDir = path.resolve(outDir);
        this.buildOutputPath = path.resolve(outDir + "/buildoutput");

        this.dtkPath = path.resolve(this.outDir + "/dtk");

        this.dtkBuildPath = path.resolve(this.dtkPath + "/util/buildScripts");
    }
}

module.exports = DtkHelper;
