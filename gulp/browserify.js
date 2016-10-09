'use strict'

import path from 'path'
import browserify from 'browserify'
import watchify from 'watchify'
import envify from 'envify'
import babelify from 'babelify'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let config = options.config
    let dirs = config.directories
    let entries = path.join(dirs.source, dirs.scripts, config.entries.js)
    let dest = path.join(options.target, dirs.main, dirs.scripts.replace('_', ''))

    return (done) => {
        let startTime = new Date().getTime()
        gulp.src(entries, {read: false})
            .pipe(plugins.tap((file) => {
                plugins.util.log(
                    'Bundled',
                    plugins.util.colors.cyan(path.relative(dirs.source, file.path))
                )
                file.contents = browserify(file.path, {
                    debug: (!args.production) ? true : false,
                    transform: [
                        babelify,
                        envify
                    ]
                }).bundle()
            }))
            .pipe(plugins.buffer())
            .pipe(plugins.if(!args.production,
                plugins.sourcemaps.init({loadMaps: true}))
            )
            .pipe(plugins.if(args.production, plugins.uglify()))
            .on('error', plugins.notify.onError(config.defaultNotification))
            .pipe(plugins.rename((filepath) => {
                filepath.dirname = filepath.dirname.replace(dirs.source, '').replace('_', '')
            }))
            .pipe(plugins.if(!args.production, plugins.sourcemaps.write('./')))
            .pipe(gulp.dest(dest))
            .on('end', (file) => browserSync.reload('*.js'))
        done()
    }
}
