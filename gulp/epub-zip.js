'use strict';

import path from 'path'
import fs from 'fs'

export default function(gulp, plugins, browserSync, options) {
    let buildDir = path.join(options.target, '**/*')

    // Zip -> turns build_dir/ into build_dir.epub
    return (done) => {
        // create the mimetype file
        fs.writeFileSync(
            path.join(options.target, 'mimetype'),
            'application/epub+zip'
        )

        gulp.src(buildDir)
            .pipe(plugins.zip(`${options.target}.epub`))
            .pipe(gulp.dest('./'))
        done()
    }
}
