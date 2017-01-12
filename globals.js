'use strict'

import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import moment from 'moment'
import foldero from 'foldero'
import yaml from 'js-yaml'
import gm from 'gm'

// primary configuration file
import configFile from './_config.json'

export default function(args) {

    // generate a random hash to uniquely identify the build
    const hash = crypto.randomBytes(20).toString('hex')

    // initialize the date
    const now = moment({})
    const date = {
        short: moment(now).format('YYYY-MM-DD'),
        long: moment(now).format('YYYY-MM-DDThh:mm:ss') + 'Z'
    }

    // default gulp-notify options
    const notification = function(err) {
        return {
            subtitle: err.plugin,
            message: err.message,
            sound: 'default',
            onLast: true,
        }
    }

    // default html-tidy options
    const htmltidy = {
        doctype: 'html5',
        dropEmptyElements: false,
        // indent: true,
        // indentSpaces: 4,
        numericEntities: true,
        wrap: 0
    }

    // combine configurations into one object
    const config = Object.assign({},
        configFile,
        htmltidy,
        notification
    )

    // construct book data
    let dirs = config.directories
    let imageWidths = config.globals['image-widths']

    // add src/data files to the global
    let dataPath = path.join(dirs.source, dirs.data)
    let data = {}
    if (fs.existsSync(dataPath)) {

        // convert directory to JS Object
        data = foldero(dataPath, {
            recurse: true,
            whitelist: '(.*/)*.+\.(json|ya?ml)$',
            loader: function loadAsString(file) {
                let data = {}
                if (path.extname(file).match(/^.ya?ml$/)) {
                    data = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
                } else {
                    data = JSON.parse(fs.readFileSync(file, 'utf8'))
                }
                return data
            }
        })

        const conversions = {
            '.eps': '.png',
            '.jpeg': '.jpg',
            '.tif': '.jpg',
            '.tiff': '.jpg'
        }

        // add extra metadata to the images object
        if (data._images) {
            data._images = data._images.map((image) => {
                // let filename = image.src
                // let imagePath = path.join(dirs.source, dirs.images, filename)
                // if (!fs.existsSync(imagePath)) {
                //     let ext = path.extname(image.src)
                //     let re = new RegExp(`${ext}$`, 'g')
                //     filename = image.src.replace(re, conversions[ext])
                // }
                // imagePath = path.join(dirs.source, dirs.images, filename)
                //
                // // read the metadata of the image using GraphicsMagick
                // // requires GraphicksMagick
                // // macOS: ```brew install graphicksmagick```
                // gm(imagePath).size((err, size) => {
                //     image.width = Math.min(size.width, imageWidths.max)
                //     image.height = Math.floor(size.height * (image.width / size.width))
                //     image.full = filename
                // })
                return image
            })
        }
    }

    // return the full options object
    return {
        args: args,
        config: config,
        data: data,
        build: {
            date: date,
            hash: hash
        },
        target: args.production ?
            path.join(config.directories.destination, `${config.metadata.productcode}_${date.short}`) :
            config.directories.temporary
    }
}
