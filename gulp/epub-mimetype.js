'use strict';

import path from 'path'
import stream from 'stream'

export default function(gulp, plugins, browserSync, options) {
    // construct stream from a filename and string contents
    function string_src(filename, string) {
      var src = stream.Readable({objectMode: true})
      src._read = function () {
        this.push(new plugins.util.File({
          cwd: "",
          base: "",
          path: filename,
          contents: new Buffer(string)
        }))
        this.push(null)
      }
      return src
    }

    // Mimetype -> creates ./mimetype
    return (done) => {
        string_src('mimetype', 'application/epub+zip')
            .pipe(gulp.dest(path.resolve(options.target)))
            .on('end', () => done())
    }
}
