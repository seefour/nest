'use strict'

import path from 'path'
import del from 'del'

export default function(gulp, plugins, browserSync, options) {
    let dirs = options.config.directories

    // Clean
    return (done) => {
            del([
            path.join(dirs.temporary),
            path.join(dirs.destination)
        ])
        done()
    }
}
