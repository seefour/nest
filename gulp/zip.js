'use strict';

import path from 'path'

export default function(gulp, plugins, browserSync, options) {
    // only run on production files
    let target = path.join(
        options.config.directories.destination,
        `${options.config.metadata.title}_${options.date}`
    )
    let buildDir = path.join(target, '**/*')

    // Zip -> turns build_dir/ into build_dir.epub
    return (done) => {
        gulp.src(buildDir)
            .pipe(plugins.zip(`${target}.epub`))
            .pipe(gulp.dest('./'))
            .on('end', () => done())
    }
}
