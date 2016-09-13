/**
 * epub-required files
 * META-INF/container.xml
 * OEBPS/package.opf
 * manifest
 **/

'use strict';

import glob from 'glob'
import mime from 'mime'
import path from 'path'
import pug from 'pug'
import fs from 'fs'

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
    let dirs = config.directories
    let entries = config.entries
    let destContainer = path.join(taskTarget, dirs.container)
    let destManifest = path.join(taskTarget, dirs.main)
    let templateContainer = path.join(dirs.source, dirs.content, dirs.layouts, entries.container)
    let templateManifest = path.join(dirs.source, dirs.content, dirs.layouts, entries.manifest)

    // ./META-INF/container.xml
    gulp.task('container', () => {
        return gulp.src(templateContainer)
            .pipe(plugins.changed(destContainer))
            .pipe(plugins.plumber())
            .pipe(plugins.pug({
                pug: pug,
                pretty: true,
                locals: {
                    config: config,
                    debug: true
                }
            }))
            .pipe(plugins.rename(function(path) {
                path.extname = '.xml'
            }))
            .pipe(gulp.dest(destContainer))
    })

    // ./mimetype
    gulp.task('mimetype', () => (
        fs.writeFileSync(path.join(taskTarget, 'mimetype'), 'application/epub+zip')
    ))

    // OEBPS/package.opf
    gulp.task('manifest', function() {
        let manifestMap = (files) => {
            // create the manifest array
            let manifest = []
            let ids = []
            for (var i = 0; i < files.length; i++) {
                let mimetype = mime.lookup(path.extname(files[i]))
                let id = `${path.extname(files[i]).replace('.', '')}-${path.basename(files[i], path.extname(files[i]))}`
                if (ids.indexOf(id) >= 0) {
                    let root = id
                    let n = 0
                    do {
                        n++
                        id = `${root}-${n}`
                    } while (ids.indexOf(id) >= 0)
                }
                ids.push(id)
                if (mimetype !== 'application/octet-stream') {
                    let item = {
                        id: id,
                        path: path.relative(destManifest, files[i]),
                        properties: '',
                        type: mimetype
                    }
                    manifest.push(item)
                }
            }

            // create timestamp with format YYYY-MM-DDTHH:MM:00Z
            let timestamp = new Date()
            timestamp.setSeconds(Math.round(timestamp.getSeconds() / 60) * 60)
            config.metadata.modified = timestamp.toISOString().replace(/\.\d+Z/g, 'Z')

            // build the manifest opf file from the pug template
            return gulp.src(templateManifest)
                .pipe(plugins.changed(destManifest))
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
                .pipe(plugins.rename(function(path) {
                    path.extname = '.opf'
                }))
                .pipe(gulp.dest(destManifest))
        }

        glob(path.join(destManifest, '**/*'), function(err, data) {
            if (err) {
                console.error(err)
            }
            return manifestMap(data)
        })
    })

    // all epub-related tasks
    gulp.task('epub', [
        'container',
        'mimetype',
        'manifest'
    ])
}
