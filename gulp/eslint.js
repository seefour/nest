/*eslint no-process-exit:0 */

'use strict'

import path from 'path'

export default function(gulp, p, browserSync, options) {
    const dirs = options.config.directories

    // ESLint
    return (done) => {
        gulp.src([
                path.join('gulpfile.babel.js'),
                path.join(dirs.source, '**/*.js')
            ])
            .pipe(browserSync.reload({
                stream: true,
                once: true
            }))
            .pipe(p.eslint({
                useEslintrc: true
            }))
            .pipe(p.eslint.format())
            .pipe(p.if(!browserSync.active, p.eslint.failAfterError()))
            .on('error', function() {
                if (!browserSync.active) {
                    process.exit(1)
                }
            })
            .on('end', () => done())
    }
}
