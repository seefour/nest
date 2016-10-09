'use strict'

import fs from 'fs'
import path from 'path'
import foldero from 'foldero'
import pug from 'pug'
import yaml from 'js-yaml'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let config = options.config
    let dirs = config.directories
    let entries = config.entries

    let dest = path.join(options.target, dirs.main)
    let dataPath = path.join(dirs.source, dirs.data)

    // Pug template compile (formerly Jade)
    return (done) => {
        let bookData = {}
        if (fs.existsSync(dataPath)) {
            // Convert directory to JS Object
            bookData = foldero(dataPath, {
                recurse: true,
                whitelist: '(.*/)*.+\.(json|ya?ml)$',
                loader: function loadAsString(file) {
                    let json = {}
                    try {
                        if (path.extname(file).match(/^.ya?ml$/)) {
                            json = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
                        } else {
                            json = JSON.parse(fs.readFileSync(file, 'utf8'))
                        }
                    } catch (e) {
                        console.log('Error Parsing DATA file: ' + file)
                        console.log('==== Details Below ====')
                        console.log(e)
                    }
                    return json
                }
            })
        }

        // Add --debug option to your gulp task to view
        // what data is being loaded into your templates
        if (args.debug) {
            console.log('==== DEBUG: book.data being injected to templates ====')
            console.log(bookData)
            console.log('\n==== DEBUG: _config.json being injected to templates ====')
            console.log(config)
        }

        // Use the production config elements when appropriate
        if (args.production) {
            config.baseUrl = config.production.baseUrl
        }

        // hack to get around pug's epub-invlaid strict doctype
        let type = {
            strict: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
            html: '<!DOCTYPE html>'
        }

        gulp.src(path.join(dirs.source, dirs.content, entries.html))
            .pipe(plugins.changed(dest))
            .pipe(plugins.data(function(file) {
                return {
                    book: {
                        data: bookData
                    },
                    config: config,
                    debug: true,
                    filename: path.basename(file.path, path.extname(file.path))
                }
            }))
            .pipe(plugins.pug({
                pug: pug,
                pretty: true
            }))
            .pipe(plugins.htmlmin({
                collapseBooleanAttributes: false,
                conservativeCollapse: true,
                removeCommentsFromCDATA: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                keepClosingSlash: true,
                caseSensitive: true
            }))
            .pipe(plugins.rename((path) => {
                path.extname = '.xhtml'
            }))
            .pipe(plugins.replace(type.strict, type.html))
            .pipe(gulp.dest(dest))
            .on('end', browserSync.reload)

        done()
    }
}
