'use strict'

import path from 'path'
import codes from '../_inflect.json'

export default function(gulp, plugins, browserSync, options) {
    let args = options.args
    let config = options.config
    let dirs = config.directories
    let entries = config.entries

    let dest = path.join('indesign', 'cleaned')

    // returns true if the node is an empty text string
    function nodeIsEmpty(node) {
        // node exists, is a text node, and is empty after trim
        return node && node.nodeType === 3 && node.nodeValue.trim().length === 0
    }

    // remove whitespace
    function removePrecedingWhitespace(el) {
        // if both of the previous 2 nodes are text nodes, remove one
        let prev = el.previousSibling
        if (nodeIsEmpty(prev) && nodeIsEmpty(prev.previousSibling)) {
            prev.remove()
        }
    }

    function setAttributes(el, item) {
        if (item.html) el.className = item.selector.replace('.', '')
        if (item['epub-type']) el.setAttribute('epub:type', item['epub-type'])
        if (item.dpub) el.setAttribute('role', item.dpub)
        return el
    }

    function saveChildren(el, newEl) {
        while (el.hasChildNodes()) {
            // remove the first child
            let child = el.removeChild(el.firstChild)

            // add non-empty children to the new element
            if (!nodeIsEmpty(child)) {
                newEl.appendChild(child)
            }
        }
        el.parentNode.replaceChild(newEl, el)
    }

    function inflect(document, item) {
        let elements = document.querySelectorAll(item.selector)

        for (let el of elements) {
            removePrecedingWhitespace(el)

            let newEl = (item.remove) ? document.createDocumentFragment() :
                (item.html) ? setAttributes(document.createElement(item.html), item) : null

            if (newEl) {
                saveChildren(el, newEl)
            } else {
                setAttributes(el, item)
            }

        }
    }

    // InDesign HTML cleanup
    return (done) => {
        gulp.src(path.join('indesign', 'src', '*.html'))
            .pipe(plugins.plumber())
            .pipe(plugins.dom(function() {
                for (let item of codes) {
                    inflect(this, item)
                }
                return this
            }))
            .pipe(plugins.jsbeautifier({
                max_preserve_newlines: 0,
                wrap_line_length: 0
            }))
            .pipe(plugins.htmlmin({
                caseSensitive: true,
                collapseBooleanAttributes: false,
                keepClosingSlash: true,
                preserveLineBreaks: true,
                removeCommentsFromCDATA: true,
                removeEmptyAttributes: true,
                removeEmptyElements: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }))
            .pipe(plugins.jsbeautifier({
                wrap_line_length: 250
            }))
            // .pipe(plugins.if(args.pug, () => {
            // }))
            // .pipe(plugins.changed(dest))
            .pipe(gulp.dest(dest))
        done()
    }
}
