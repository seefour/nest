'use strict';

import glob from 'glob'
import mime from 'mime'
import path from 'path'
import pug from 'pug'

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
    let dirs = config.directories
    let entries = config.entries
    let dest  = path.join(taskTarget, dirs.oebps)

    // Manifest
    gulp.task('manifest', function() {

        let manifestMap = (files) => {
            // create the manifest array
            let manifest = []
            let ids = []
            for(var i = 0; i < files.length; i++) {
                let mimetype = mime.lookup(path.extname(files[i]))
                let id = `${path.basename(files[i], path.extname(files[i]))}-${path.extname(files[i]).replace('.', '')}`
                if (ids.indexOf(id) >= 0) {
                    let root = id
                    let n = 0
                    do {
                        n++
                        id = `${root}-${n}`
                    } while (ids.indexOf(id) >= 0)
                }
                ids.push(id)
                if (mimetype !==  'application/octet-stream') {
                    let item = {
                        id: id,
                        path: path.relative(dest, files[i]),
                        properties: '',
                        type: mimetype
                    }
                    manifest.push(item)
                }
            }

            // create timestamp
            config.metadata.modified = new Date()

            // build the manifest opf file from the pug template
            return gulp.src(path.join(dirs.source,entries.manifest))
            .pipe(plugins.changed(dest))
            .pipe(plugins.plumber())
            .pipe(plugins.pug({
                pug: pug,
                pretty: true,
                locals: {
                    config: config,
                    debug: true,
                    files: manifest
                }
            }))
            .pipe(plugins.rename(function(path){
                path.basename = path.basename.slice(1)
                path.extname = '.opf'
            }))
            .pipe(plugins.changed(dest))
            .pipe(gulp.dest(dest))
        }

        glob(path.join(dest, '**/*'), function(err, data) {
            if (err) {
                console.error(err)
            }
            return manifestMap(data)
        })
    })
}
