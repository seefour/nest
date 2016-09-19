'use strict'

import path from 'path'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let dirs = options.config.directories

    // Watch task
    return (done) => {
        if (!args.production) {
            // Styles
            gulp.watch([
                path.join(dirs.source, dirs.styles, '**/*.{scss,sass}')
            ], gulp.series('sass'))

            // Jade Templates
            gulp.watch([
                path.join(dirs.source, '**/*{.jade,.pug}'),
                path.join(dirs.source, dirs.data, '**/*.{json,yaml,yml}')
            ], gulp.series('pug'))

            // Copy
            gulp.watch([
                path.join(dirs.source, '**/*'),
                '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}'),
                '!' + path.join(dirs.source, '**/*.jade'),
                '!' + path.join(dirs.source, '**/*.pug')
            ], gulp.series('copy'))

            // Images
            gulp.watch([
                path.join(dirs.source, dirs.images, '**/*.{jpg,jpeg,gif,svg,png}')
            ], gulp.series('imagemin'))

            // All other files
            gulp.watch([
                path.join(dirs.temporary, '**/*'),
                '!' + path.join(dirs.temporary, '**/*.{css,map,html,js,json}')
            ]).on('change', browserSync.reload)
        }
        done()
    }
}
