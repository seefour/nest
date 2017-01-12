'use strict';

import path from 'path';

export default function(gulp, p, browserSync, options) {
    const dirs = options.config.directories
    const dest = path.join(options.target, dirs.main)

    // Copy
    return (done) => {
        gulp.src([
                path.join(dirs.source, '**/*'),
                '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}')
            ], { base: dirs.source })
            .pipe(gulp.dest(dest))
            .on('end', () => done())
    }
}
