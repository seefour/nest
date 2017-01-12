'use strict';

import gulp from 'gulp'
import path from 'path'
import fs from 'fs'
import bs from 'browser-sync'
import minimist from 'minimist'
import p from 'gulp-load-plugins'

// create browserSync instance
const browserSync = bs.create()

// get command line arguments
const args = minimist(process.argv.slice(2))
const argMap = {
    d: 'debug',
    f: 'force',
    o: 'open',
    p: 'production'
}
for (let char in argMap) {
    if (args[char]) args[argMap[char]] = true
}

let globals = require('./globals.js')(args)

/* TASK DEFINITIONS */

// gulp task files
const taskPath = path.resolve('./gulp')

// task getter
function getTask(name) {
    return require(path.join(taskPath, name))(gulp, p(), browserSync, globals)
}

// define all tasks in taskPath
fs.readdirSync(taskPath)
    .forEach((task) => {
        if (task.match(/\.js$/i)) {
            // parse the task name
            // dashes become colons (e.g. epub-manifest.js becomes epub:manifest)
            let taskName = path.basename(task, '.js').replace('-', ':')
            gulp.task(taskName, getTask(task))
        }
    })

/* TASK SEQUENCE DEFINITIONS */

// Build production-ready code
gulp.task('build',
    gulp.parallel('copy', 'imagemin', 'pug', 'sass', 'scripts:vendor', 'scripts:main')
)

// EPUB-related tasks
gulp.task('epub',
    gulp.series(
        gulp.parallel('epub:container', 'epub:manifest', 'epub:mimetype'),
        'epub:validate'
    )
)

// Server tasks with watch
gulp.task('serve',
    gulp.parallel('imagemin', 'copy', 'pug', 'sass', 'scripts:vendor', 'scripts:main', 'browserSync', 'watch')
)

// Stage task
gulp.task('stage',
    gulp.series('clean', 'build', 'epub')
)

// Default task
gulp.task('default',
    gulp.series('clean', 'build', 'epub', 'zip')
)
