'use strict';

import path from 'path'

export default function(gulp, p, browserSync, options) {
    const dirs = options.config.directories

    // only run on production files
    const target = path.join(
        dirs.destination,
        `${options.config.metadata.productcode}_${options.build.date.short}`
    )

    // epub must start with the mimetype file
    const buildFiles = [
        path.join(target, 'mimetype'),
        path.join(target, '**/*')
    ]

    // Zip -> turns ./build_dir/ into ./build_dir.epub
    return (done) => {
        gulp.src(buildFiles)
            .pipe(p.zip(`${target}.epub`))
            .pipe(gulp.dest('./'))
            .on('end', () => done())
    }
}
