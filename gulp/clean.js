'use strict'

import path from 'path'
import del from 'del'

export default function(gulp, plugins, browserSync, options) {
    let dirs = options.config.directories
    let title = options.config.metadata.title

    // Clean
    return (done) => {
            del([
            path.join(dirs.destination, `${title}_${options.date}`),
            path.join(dirs.destination, `${title}_${options.date}.epub`),
            path.resolve(dirs.temporary)
        ]).then(() => done())
    }
}
