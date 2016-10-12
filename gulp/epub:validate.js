'use strict';

import {exec} from 'child_process'

export default function(gulp, plugins, browserSync, options) {
    const dirs = options.config.directories
    const epubcheck = options.config.production.epubcheck
    const report = (options.target === dirs.temporary) ? `${options.target}/report.xml` : `${options.target}.report.xml`

    // Validate -> runs epubcheck.jar and outputs an xml
    return (done) => {
        exec(`java -jar ${epubcheck} ${options.target}/ -mode exp -out ${report}`,
            () => done()
        )
    }
}
