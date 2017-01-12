'use strict'

import path from 'path'
import pug from 'pug'

export default function(gulp, p, browserSync, options) {
    const args = options.args
    const config = options.config
    const dirs = config.directories
    const entries = config.entries

    const dest = path.join(options.target, dirs.main)

    // Pug template compile (formerly Jade)
    return (done) => {
        // Use the production config elements when appropriate
        if (args.production) {
            config.baseUrl = config.production.baseUrl
        }

        gulp.src(path.join(dirs.source, dirs.content, entries.html), {
                base: path.join(dirs.source, dirs.content)
            })
            .pipe(p.data(function(file) {
                return {
                    book: {
                        data: options.data
                    },
                    config: config,
                    debug: true,
                    filename: path.basename(file.path, path.extname(file.path)),
                    hash: options.build.hash
                }
            }))
            .pipe(p.pug({
                debug: false,
                pug: pug
            }))
            .pipe(p.rename({
                extname: '.xhtml'
            }))
            .pipe(p.htmltidy(config.htmltidy))
            .pipe(gulp.dest(dest))
            .on('end', () => {
                browserSync.reload
                done()
            })
    }
}
