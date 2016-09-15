'use strict';

import path from 'path'
import pug from 'pug'

export default function(gulp, plugins, browserSync, options) {
    let config = options.config
    let dirs = config.directories
    let entries = config.entries

    let template = path.join(dirs.source, dirs.content, dirs.layouts, entries.container)
    let dest = path.join(options.target, dirs.container)

    // Container -> ./META-INF/container.xml
    return (done) => {
        return gulp.src(template)
            .pipe(plugins.changed(dest))
            .pipe(plugins.plumber())
            .pipe(plugins.pug({
                pug: pug,
                pretty: true,
                locals: {
                    config: config,
                    debug: true
                }
            }))
            .pipe(plugins.rename(function(path) {
                path.extname = '.xml'
            }))
            .pipe(gulp.dest(dest))
        done()
    }
}
