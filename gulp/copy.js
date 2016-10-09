'use strict';

import path from 'path';

export default function(gulp, plugins, browserSync, options) {
    let dirs = options.config.directories
    let dest = path.join(options.target, dirs.main)

    // Copy
    return (done) => {
        gulp.src([
                path.join(dirs.source, '**/*'),
                '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}')
            ])
            .pipe(plugins.changed(dest))
            .pipe(gulp.dest(dest))
        done()
    }
}
