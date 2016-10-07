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
            ], gulp.parallel('sass'))

            // Jade Templates
            gulp.watch([
                path.join(dirs.source, '**/*.jade'),
                path.join(dirs.source, '**/*.pug'),
                path.join(dirs.source, dirs.data, '**/*.{json,yaml,yml}')
            ], gulp.parallel('pug'))

            // Copy
            gulp.watch([
                path.join(dirs.source, '**/*'),
                '!' + path.join(dirs.source, '{**/\_*,**/\_*/**}'),
                '!' + path.join(dirs.source, '**/*.jade'),
                '!' + path.join(dirs.source, '**/*.pug')
            ], gulp.parallel('copy'))

            // Images
            gulp.watch([
                path.join(dirs.source, dirs.images, '**/*.{jpg,jpeg,gif,svg,png}')
            ], gulp.parallel('imagemin'))

            // All other files
            gulp.watch([
                path.join(dirs.temporary, '**/*'),
                '!' + path.join(dirs.temporary, '**/*.{css,map,html,js,json}')
            ]).on('change', browserSync.reload)
        }
        done()
    }
}
