'use strict'

import path from 'path'
import del from 'del'

export default function(gulp, p, browserSync, options) {
    const dirs = options.config.directories
    const title = options.config.metadata.productcode

    // Clean
    return (done) => {
            del([
            path.join(dirs.destination, `${title}_${options.date}`),
            path.join(dirs.destination, `${title}_${options.date}.*`),
            path.resolve(dirs.temporary)
        ]).then(() => done())
    }
}
