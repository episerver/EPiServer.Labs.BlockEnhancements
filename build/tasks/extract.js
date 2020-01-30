"use strict";

const gulp = require("gulp"),
    path = require("path"),
    glob = require("glob"),
    fs = require("fs"),
    unzip = require("gulp-unzip"),
    gutil = require("gulp-util");

module.exports = (dtkHelper) => {

    gulp.task("extract", [], (done) => {
        // Resolve the path to the dtk zip file.
        const dtkZipFile = path.resolve(glob.sync("packages/EPiServer.CMS.UI.Sources*/tools/*.zip")[0]);
        const destination = dtkHelper.dtkPath;

        fs.stat(destination, (err, stat) => {
            if (stat && stat.isDirectory()) {
                gutil.log(gutil.colors.cyan(dtkZipFile, "has already been decompressed to: ", destination));
                done();

                return;
            }
            gulp.src(dtkZipFile)
                .pipe(unzip())
                .pipe(gulp.dest(destination))
                .on("end", () => {
                    done();
                });
        });
    });
};
