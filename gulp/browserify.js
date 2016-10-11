'use strict'

import path from 'path'
import es from 'event-stream'
import glob from 'glob'
import browserify from 'browserify'
import watchify from 'watchify'
import envify from 'envify'
import babelify from 'babelify'
import vbuffer from 'vinyl-buffer'
import vsource from 'vinyl-source-stream'

export default function(gulp, plugins, browserSync, options) {
    const args = options.args
    const config = options.config
    const dirs = config.directories
    const entries = path.join('./', dirs.source, dirs.scripts, config.entries.js)
    const dest = path.join(options.target, dirs.main)

    return (done) => {
        glob(entries, (err, files) => {
            if (err) done(err)

            return files.map((entry) => {
                // default options
                const defaultOpts = {
                    entries: [entry],
                    debug: (!args.production) ? true : false,
                    transform: [
                        babelify,
                        envify
                    ]
                }

                // browserify instance
                let b = browserify(defaultOpts)

                // make it a watchify instance for non-production
                if (!args.production) {
                    let watchOpts = Object.assign({}, watchify.args, defaultOpts)
                    b = watchify(browserify(watchOpts))
                }

                const bundleTask = () => {
                    let startTime = new Date().getTime()
                    b.bundle()
                        .on('error', plugins.notify.onError(config.defaultNotification))
                        .pipe(vsource(entry))
                        .pipe(vbuffer())
                        // sourcemaps for non-production build
                        .pipe(plugins.if(!args.production, plugins.sourcemaps.init({loadMaps: true})))
                        // uglify for production build
                        .pipe(plugins.if(args.production, plugins.uglify()))
                        .on('error', plugins.notify.onError(config.defaultNotification))
                        // src/_scripts/**/*.js -> scripts/**/*.js
                        .pipe(plugins.rename((filepath) => filepath.dirname = filepath.dirname.replace(dirs.source, '').replace('_', '')))
                        .pipe(plugins.if(!args.production, plugins.sourcemaps.write('./')))
                        .pipe(gulp.dest(dest))
                        .on('end', () => {
                            let time = (new Date().getTime() - startTime) / 1000
                            console.log(`${plugins.util.colors.cyan(path.relative(path.join(dirs.source, dirs.scripts), entry))} was browserified in ${plugins.util.colors.magenta(time+' s')}`)
                            // signal completion synchronously for production builds
                            if (files.indexOf(entry) === files.length - 1) done()
                            return browserSync.reload('*.js')
                        })
                }

                if (!args.production) {
                    b.on('update', bundleTask)
                    b.on('log', plugins.util.log)
                }

                return bundleTask()
            })
        })
        // signal asynchronous completion for non-production
        if (!args.production) done()
    }
}
