'use strict'

import path from 'path'

export default function(gulp, p, browserSync, options) {
    const config = options.config
    const dirs = config.directories
    const entry = path.join(dirs.source, dirs.images)
    const dest = path.join(options.target, dirs.main, dirs.images.replace(/^_/, ''))

    const formats = '{[^_]**/*.{gif,ico,jpeg,jpg,png,svg},[^_]*.{gif,ico,jpeg,jpg,png,svg}}'

    // Imagemin
    return (done) => {
        gulp.src(path.join(entry, formats), {
                base: entry
            })
            .pipe(p.changed(dest))
            .pipe(p.imageResize({
                width: config.globals['image-widths'].max
            }))
            .pipe(p.imagemin())
            .pipe(gulp.dest(dest))
            .on('end', () => done())
    }
}
