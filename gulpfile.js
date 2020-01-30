/* eslint-env es6, node */
"use strict";

const gulp = require("gulp"),
    del = require("del"),
    DtkHelper = require("./build/dtkHelper"),
    program = require("commander");

program
    .option("--configuration <configuration>", "Set the build configuration", /^(debug|release)$/i, "debug")
    .parse(process.argv);

// Create the dtk helper
let dtkHelper = new DtkHelper("out", program.configuration);

// Import all build tasks
require("./build/tasks/extract")(dtkHelper);

gulp.task("default", ["setup"]);

gulp.task("setup", ["extract"]);

gulp.task("clean", () => {
    return del.sync([dtkHelper.outDir, "packages"]);
});
