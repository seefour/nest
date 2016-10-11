/*eslint no-process-exit:0 */

'use strict'

import path from 'path'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let dirs = options.config.directories

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
            .pipe(plugins.eslint({
                useEslintrc: true
            }))
            .pipe(plugins.eslint.format())
            .pipe(plugins.if(!browserSync.active, plugins.eslint.failAfterError()))
            .on('error', function() {
                if (!browserSync.active) {
                    process.exit(1)
                }
            })
            .on('end', () => done())
    }
}
