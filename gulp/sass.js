'use strict'

import path from 'path'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default function(gulp, p, browserSync, options) {
    const args = options.args
    const config = options.config
    const dirs = config.directories
    const entries = config.entries
    const dest = path.join(options.target, dirs.main, dirs.styles.replace('_', ''))

    // autoprefixer support matrix
    const supported = [
        'last 2 version',
        '> 5%',
        'safari 5',
        'ios 6',
        'android 4'
    ]

    // postcss configuration
    const processors = (args.production) ? [
        autoprefixer(supported),
        cssnano({
            safe: true
        })
    ] : [
        autoprefixer(supported)
    ]

    // Sass
    return (done) => {
        gulp.src(path.join(dirs.source, dirs.styles, entries.css), {
                base: path.join(dirs.source, dirs.styles)
            })
            .pipe(p.if(!args.production, p.sourcemaps.init()))
            .pipe(p.sass({
                outputStyle: 'expanded',
                precision: 10
            }))
            .on('error', p.notify.onError(config.notification))
            .pipe(p.postcss(processors))
            .pipe(p.if(!args.production, p.sourcemaps.write('./')))
            .pipe(gulp.dest(dest))
            .on('end', () => {
                browserSync.stream({
                    match: '**/*.css'
                })
                done()
            })
    }
}
