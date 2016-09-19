'use strict';

import path from 'path'
import fs from 'fs'

export default function(gulp, plugins, browserSync, options) {
    // Mimetype -> ./mimetype
    return (done) => {
        fs.writeFileSync(
            path.join(options.target, 'mimetype'),
            'application/epub+zip'
        )
        done()
    }
}
