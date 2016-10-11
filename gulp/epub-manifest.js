'use strict';

import path from 'path'
import fs from 'fs'
import globby from 'globby'
import mime from 'mime'
import pug from 'pug'

export default function(gulp, plugins, browserSync, options) {
    let config = options.config
    let dirs = config.directories
    let entries = config.entries

    let template = path.join(dirs.source, dirs.content, dirs.layouts, entries.manifest)
    let dest = path.join(options.target, dirs.main)

    // helper function to ensure IDs are unique
    const ids = []
    function makeIdUnique(id) {
        let root = id
        let n = 0
        do {
            n++
            id = `${root}-${n}`
        } while (ids.indexOf(id) >= 0)
        return id
    }

    // build the manifest array
    function manifestMap(files) {
        let manifest = []
        for (let file of files) {
            let mimetype = mime.lookup(path.extname(file))

            // id string: ext-filename
            let id = `${path.extname(file).replace('.', '')}-${path.basename(file, path.extname(file))}`
            if (ids.indexOf(id) >= 0) makeIdUnique(id)
            ids.push(id)
            if (mimetype !== 'application/octet-stream') {
                let item = {
                    id: id,
                    path: path.relative(dest, file),
                    properties: '', // todo: generate properties
                    type: mimetype
                }
                manifest.push(item)
            }
        }
        return manifest
    }

    // Manifest -> OEBPS/package.opf
    return (done) => {

        // create timestamp with format YYYY-MM-DDTHH:MM:00Z
        let timestamp = new Date()
        timestamp.setSeconds(Math.round(timestamp.getSeconds() / 60) * 60)
        config.metadata.modified = timestamp.toISOString().replace(/\.\d+Z/g, 'Z')

        // build the manifest array
        let files = glob.sync(path.join(dest, '**/*'))
        let manifestData = manifestMap(files)

        // build the manifest opf file from the pug template
        gulp.src(template)
            .pipe(plugins.changed(dest))
            .pipe(plugins.pug({
                pug: pug,
                pretty: true,
                locals: {
                    config: config,
                    debug: true,
                    files: manifestData
                }
            }))
            .pipe(plugins.rename((path) => path.extname = '.opf'))
            .pipe(gulp.dest(dest))
            .on('end', () => done())
    }
}
