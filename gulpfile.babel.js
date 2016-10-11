'use strict';

import gulp from 'gulp'
import path from 'path'
import fs from 'fs'
import plugins from 'gulp-load-plugins'
import minimist from 'minimist'
import bs from 'browser-sync'

// primary configuration file
import configFile from './_config.json'

// the default gulp-notify options
const defaultNotification = function(err) {
    return {
        subtitle: err.plugin,
        message: err.message,
        sound: 'default',
        onLast: true,
    }
}

const config = Object.assign({}, configFile, defaultNotification)

// create browserSync instance
const browserSync = bs.create()

// get command line arguments
const args = minimist(process.argv.slice(2))

// initialize the date (YYY-MM-DD) for use in build directory name
const date = new Date().toJSON().slice(0, 10)

// construct options object
const options = {
    args: args,
    config: config,
    date: date,
    target: args.production ?
        path.join(config.directories.destination, `${config.metadata.title}_${date}`) :
        config.directories.temporary
}

// gulp task files
const taskPath = path.resolve('./gulp')

// task getter
function getTask(name) {
    return require(path.join(taskPath, name))(gulp, plugins(), browserSync, options)
}

// define all tasks in taskPath
fs.readdirSync(taskPath)
    // only include .js files
    .filter((filename) => filename.match(/\.js$/i))
    // get just the basename (no extension)
    .map((filename) => path.basename(filename, '.js'))
    // define the task
    .forEach((task) => gulp.task(task, getTask(task)))

/* TASK SEQUENCE DEFINITIONS */

// Build production-ready code
gulp.task('build',
    gulp.parallel('copy', 'imagemin', 'pug', 'sass', 'browserify')
)

// EPUB-related tasks
gulp.task('epub',
    gulp.parallel('epub-container', 'epub-manifest', 'epub-mimetype')
)

// Server tasks with watch
gulp.task('serve',
    gulp.parallel('imagemin', 'copy', 'pug', 'sass', 'browserify', 'browserSync', 'watch')
)

// Default task
gulp.task('default',
    gulp.series('clean', 'build', 'epub', 'zip')
)
