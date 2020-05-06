/* eslint-env es6, node */
"use strict";

const gulp = require("gulp"),
    DtkHelper = require("./build/dtkHelper"),
    program = require("commander");

program
    .option("--configuration <configuration>", "Set the build configuration", /^(debug|release)$/i, "debug")
    .parse(process.argv);

// Create the dtk helper
let dtkHelper = new DtkHelper("out", program.configuration);

// Import all build tasks
require("./build/tasks/extract")(dtkHelper);
require("./build/tasks/extract-telemetry-ui")(dtkHelper);

gulp.task("setup", gulp.parallel("extract", "extract-telemetry-ui"));
