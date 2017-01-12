'use strict';

import path from 'path'
import fs from 'fs'
import jsdom from 'jsdom'
import glob from 'glob'
import mime from 'mime'
import pug from 'pug'

export default function(gulp, p, browserSync, options) {
    const config = options.config
    const dirs = config.directories
    const entries = config.entries

    const dest = path.join(options.target, dirs.main)
    const template = {
        opf: path.join(dirs.source, dirs.content, dirs.layouts, entries.manifest),
        toc: path.join(dirs.source, dirs.content, dirs.layouts, entries.toc)
    }

    // initialize our empty arrays
    const files = {
        manifest: [],
        spine: [],
        remoteResources: []
    }

    //

    // HTML ids
    const coverImageID = 'cover-image'
    const navID = 'nav-doc'

    // valid formats for the spine
    const spineFormats = ['.html', '.xhtml']

    // helpers to ensure IDs are unique
    const ids = []
    const iterateId = (id) => {
        const root = id
        let n = 0
        do {
            n++
            id = `${root}-${n}`
        } while (ids.indexOf(id) >= 0)
        return id
    }

    // xml-safe id: https://www.w3.org/TR/REC-xml/#NT-Name
    const idFromString = (string) => {
        return string.trim()
            .toLowerCase()
            .replace(/[ãàáäâ]/g, 'a')
            .replace(/[ẽèéëê]/g, 'e')
            .replace(/[ìíïî]/g, 'i')
            .replace(/[õòóöô]/g, 'o')
            .replace(/[ùúüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-_]+/g, '-')
            .replace(/\-+/g, '-')
            .replace(/^\-|\-$/g, '')
            .replace(/^[^a-z]+/g, '')
    }

    // format id as ext-basename-without-ext
    const idFromPath = (file) => {
        let ext = path.extname(file).replace('.', '')
        let base = path.basename(file, path.extname(file))
        return idFromString(`${ext}-${base}`)
    }

    // modified semver sort
    const sortByPosition = (a, b) => {
        if (!a.position || !b.position) throw new Error('The position is required')

        let pa = a.position.split('.')
        let pb = b.position.split('.')

        let size = Math.max(pa.length, pb.length)

        for (let i = 0; i < size; i++) {
            let na = Number(pa[i])
            let nb = Number(pb[i])
            if (na > nb) return 1
            if (nb > na) return -1
            if (!isNaN(na) && isNaN(nb)) return 1
            if (isNaN(na) && !isNaN(nb)) return -1
        }
        return 0
    }

    // turn the props object from getDocData to a string
    const propObjToString = (propObj) => {
        let properties = []
        for (let prop in propObj) {
            if (propObj[prop]) {
                properties.push(prop)
            }
        }
        return properties.join(' ')
    }

    // h1 or first .header should be the title of the document
    const getHeaderText = (h1) => {
        let parent = h1.parentElement
        return (parent.nodeName.toUpperCase() === 'HEADER') ? parent.textContent : h1.textContent
    }

    // read html and xhtml documents and get various pieces of metadata
    const getDocData = (file) => {
        // return empty object for non-html/xhtml
        if (!spineFormats.includes(path.extname(file))) return {}

        // read the file and create a (js)dom with it for parsing
        const data = fs.readFileSync(file, 'utf8')
        const document = jsdom.jsdom(data)

        // test for epub3 item property values
        const props = {
            'cover-image': Boolean(document.getElementById(coverImageID)),
            'mathml': document.querySelectorAll('math').length > 0,
            'nav': Boolean(document.getElementById(navID)),
            'remote-resources': document.querySelectorAll('[src^=http]').length > 0,
            'scripted': document.querySelectorAll('script').length > 0,
            'svg': document.querySelectorAll('svg').length > 0,
            // querySelector doesn't work on 'epub:switch', so just ignore it
            'switch': false
        }

        // add any missing remote resources to the remoteResources array
        if (props['remote-resources']) {
            let resources = Array.from(document.querySelectorAll('[src^=http]'))
            for (let i = 0; i < resources.length; i++) {
                if (!ids.includes(idFromPath(resources[i].src))) {
                    files.remoteResources.push(getFileData(resources[i].src))
                }
            }
        }

        return {
            position: document.body.getAttribute('data-position') || null,
            title: getHeaderText(document.querySelector('h1')),
            properties: propObjToString(props)
        }
    }

    const getFileData = (file) => {
        // id string from a path
        let id = idFromPath(file)
        if (ids.includes(id)) id = iterateId(id)
        ids.push(id)

        return Object.assign({}, {
            id: id,
            path: (file.startsWith('http')) ? file : path.relative(dest, file),
            type: mime.lookup(path.extname(file))
        }, getDocData(file))
    }

    const buildFiles = () => {
        // build the manifest array
        files.manifest = glob.sync(path.join(dest, '**/*'))
            // filter out folders
            .filter((file) => {
                return (mime.lookup(path.extname(file)) !== 'application/octet-stream')
            })
            // get the metadata
            .map((file) => getFileData(file))
            // add any remoteResources found along the way
            .concat(files.remoteResources)

        // build spine files array
        files.spine = files.manifest
            // only include html and xhtml files
            .filter((file) => {
                return spineFormats.includes(path.extname(file.path))
            })
            // sort it by the position string (e.g. 2.3.5 > 1.2.0)
            .sort(sortByPosition)

        return {
            manifest: files.manifest,
            spine: files.spine
        }
    }

    // Manifest -> OEBPS/package.opf
    return (done) => {

        function buildOpf(callback) {
            // build the manifest (opf) file from the pug template
            gulp.src(template.opf)
                .pipe(p.pug({
                    pug: pug,
                    locals: {
                        build: options.build,
                        config: config,
                        files: {
                            manifest: files.manifest,
                            spine: files.spine
                        }
                    }
                }))
                .pipe(p.rename((path) => path.extname = '.opf'))
                .pipe(p.changed(dest))
                .pipe(gulp.dest(dest))
                .on('end', () => callback())
        }

        // build a dummy toc file so it's included in the manifest
        gulp.src(template.toc)
            .pipe(p.pug({
                pug: pug,
                locals: {
                    build: options.build,
                    config: config,
                    files: buildFiles().spine
                }
            }))
            .pipe(p.htmltidy(config.htmltidy))
            .pipe(p.rename({
                extname: '.xhtml'
            }))
            .pipe(p.changed(dest))
            .pipe(gulp.dest(dest))
            .on('end', () => {
                files.manifest.push(getFileData(path.join(dest, 'toc.xhtml')))
                buildOpf(() => done())
            })
    }
}
