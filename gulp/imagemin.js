'use strict'

import path from 'path'
import pngquant from 'imagemin-pngquant'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let config = options.config
    let dirs = config.directories
    let entries = config.entries
    let dest = path.join(options.target, dirs.main, dirs.images.replace(/^_/, ''))

    // Imagemin
    return (done) => {
        gulp.src(path.join(dirs.source, dirs.images, '**/*.{jpg,jpeg,gif,svg,png}'))
            .pipe(plugins.changed(dest))
            .pipe(plugins.if(args.production, plugins.imagemin({
                progressive: true,
                svgoPlugins: [{
                    removeViewBox: false
                }],
                use: [pngquant({
                    speed: 10
                })]
            })))
            .pipe(gulp.dest(dest))
            .on('end', () => done())
    }
}
