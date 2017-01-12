'use strict';

import path from 'path'
import stream from 'stream'

export default function(gulp, p, browserSync, options) {
    // construct stream from a filename and string contents
    function stringSrc(filename, string) {
        let src = stream.Readable({
            objectMode: true
        })
        src._read = function() {
            this.push(new p.util.File({
                cwd: '',
                base: '',
                path: filename,
                contents: new Buffer(string)
            }))
            this.push(null)
        }
        return src
    }

    // Mimetype -> creates ./mimetype
    return (done) => {
        stringSrc('mimetype', 'application/epub+zip')
            .pipe(gulp.dest(path.resolve(options.target)))
            .on('end', () => done())
    }
}
