'use strict'

import path from 'path'
import del from 'del'

export default function(gulp, p, browserSync, options) {
    const dirs = options.config.directories
    const title = options.config.metadata.productcode
    const date = options.build.date.short

    // `gulp clean --force` to remove everything from ./build
    const delDir = (options.args.force) ? [
        path.resolve(dirs.destination),
        path.resolve(dirs.temporary)

    // `gulp clean --mac` to remove .DS_Store files
    ] : (options.args.mac) ? [
        path.resolve('**/.DS_Store')

    // `gulp clean` (no argument) to remove today's builds
    ] : [
        path.join(dirs.destination, `${title}_${date}`),
        path.join(dirs.destination, `${title}_${date}.*`),
        path.resolve(dirs.temporary)
    ]

    // Clean
    return (done) => del(delDir).then(() => done())
}
