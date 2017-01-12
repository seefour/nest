'use strict';

import path from 'path'
import pug from 'pug'

export default function(gulp, p, browserSync, options) {
    const config = options.config
    const dirs = config.directories
    const entries = config.entries

    const template = path.join(dirs.source, dirs.content, dirs.layouts, entries.container)
    const dest = path.join(options.target, dirs.container)

    // Container -> ./META-INF/container.xml
    return (done) => {
        gulp.src(template)
            .pipe(p.changed(dest))
            .pipe(p.pug({
                pug: pug,
                pretty: true,
                locals: {
                    config: config,
                    debug: true
                }
            }))
            .pipe(p.rename({
                extname: '.xml'
            }))
            .pipe(gulp.dest(dest))
            .on('end', () => done())
    }
}
