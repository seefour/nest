'use strict'

import path from 'path'
import autoprefixer from 'autoprefixer'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let config = options.config
    let dirs = config.directories
    let entries = config.entries
    let dest = path.join(options.target, dirs.main, dirs.styles.replace('_', ''))

    // Sass compilation
    return (done) => {
        gulp.src(path.join(dirs.source, dirs.styles, entries.css))
            .pipe(plugins.changed(dest))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass({
                outputStyle: 'expanded',
                precision: 10
            }))
            .on('error', function(err) {
                plugins.util.log(err)
            })
            .on('error', plugins.notify.onError(config.defaultNotification))
            .pipe(plugins.postcss([autoprefixer({
                browsers: ['last 2 version', '> 5%', 'safari 5', 'ios 6', 'android 4']
            })]))
            .pipe(plugins.if(args.production, plugins.cssnano({
                rebase: false
            })))
            .pipe(plugins.if(!args.production, plugins.sourcemaps.write('./')))
            .pipe(gulp.dest(dest))
            .on('end', () => done())
            .pipe(browserSync.stream({
                match: '**/*.css'
            }))
    }
}
