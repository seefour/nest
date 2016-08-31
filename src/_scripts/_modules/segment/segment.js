/**
 * --------------------------------------------------------------------------
 * Segment (v1.0.0): segment.js
 * Automatically
 * Norton ebooks using Bootstrap or jQueryUI
 * by Evan Yamanishi
 * NO LICENSE
 * --------------------------------------------------------------------------
 */

const Segment = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'segment'
    const VERSION = '1.0.0'
    const NAMESPACE = 'nest'
    const DATA_KEY = `${NAMESPACE}.${NAME}`
    const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

    // initialize private(ish) variables
    const HeadingSubset = []
    const PageIDs = []
    const Level = {
        current: 0,
        previous: 0,
        previousToc: null,
        parent: null
    }

    const Default = {
        createToC: true,
        excludeClass: 'toc-exclude',
        excludeAll: true,
        tocClass: `${NAMESPACE}-contents`,
        start: 2,
        end: 4,
        sectionWrap: true
    }

    // errors borrowed from Khan Academy's tota11y library
    // https://github.com/Khan/tota11y
    const Error = {
        FIRST_NOT_H1(level, el) {
            return {
                title: 'First heading is not an <h1>.',
                description: `To give your document a proper structure for assistive technologies, it is important to lay out your headings beginning with an <h1>. The first heading was an <h${level}>.`,
                element: el
            }
        },
        NONCONSECUTIVE_HEADER(prevLevel, currLevel, el) {
            let description = `This document contains an <h${currLevel}> tag directly following an <h${prevLevel}>. In order to maintain a consistent outline of the page for assistive technologies, reduce the gap in the heading level by upgrading this tag to an <h${prevLevel+1}>`

            // Suggest upgrading the tag to the same level as `prevLevel` iff
            // `prevLevel` is not 1
            if (prevLevel !== 1) {
                description += ` or <h${prevLevel}>.`
            } else {
                description += '.'
            }

            return {
                title: `Nonconsecutive heading level used (h${prevLevel} → h${currLevel}).`,
                description: description,
                element: el
            }
        },
        NO_HEADINGS_FOUND() {
            return {
                title: 'No headings found.',
                description: 'Please ensure that all headings are properly tagged.'
            }
        }
    };



    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    class Segment {

        constructor(config) {
            if (typeof config === 'string') {
                if (data[config] === undefined) {
                    throw new Error(`No method named "${config}"`)
                }
                this[config]()
            } else {
                this.config = this._getConfig(config)
            }

            // get all the ids on the page so we can construct unique ones
            this._getPageIDs()

            // construct a subset of headings (e.g. h2-h4) based on
            // start and end values specified in config
            this._createHeadingSubset()

            // initialize the table of contents (ToC)
            if (this.config.createToC) this.toc = this._initToC()

            // build the heading object
            this.headings = this._getHeadings()
            if (this.headings.length === 0) this._postError(Error.NO_HEADINGS_FOUND())
        }


        // getters

        static get VERSION() {
            return VERSION
        }

        static get Default() {
            return Default
        }

        static get NAME() {
            return NAME
        }

        static get DATA_KEY() {
            return DATA_KEY
        }


        // public

        enable() {
            this._isEnabled = true
        }

        disable() {
            this._isEnabled = false
        }

        toggle() {
            this._isEnabled = !this._isEnabled
        }

        destroy() {
            $.removeData(this._element, DATA_KEY)

            $(document).off(EVENT_KEY)

            this._isEnabled = null
        }


        // private

        _getConfig(config) {
            return $.extend({},
                this.constructor.Default,
                config
            )
        }

        _getHeadings() {
            let headings = {}
            let c = this._headingCount()
            headings.count = c.heads
            headings.length = c.total

            headings.items = this._getHeadingItems()

            return headings
        }

        _headingCount() {
            let heads = {}
            for (let heading of HEADINGS) {
                heads[heading] = $(heading).length
            }
            return heads
        }

        _validateHeading(item, el) {
            // first heading not h1
            if (Level.previous === 0 && item.level !== 1) {
                this._postError(Error.FIRST_NOT_H1(item.level, el))
                return false
            } else if (Level.previous !== 0 && item.level - Level.previous > 1) {
                this._postError(Error.NONCONSECUTIVE_HEADER(Level.previous, item.level, el))
                return false
            }
            return true
        }

        _postError(err) {
            let errString = `HEADING ERROR\nType: ${err.title}\nInfo: ${err.description}`
            if (err.element) {
                console.error(errString, '\nProblem heading:', err.element)
                $(err.element).addClass('error--heading')
            } else {
                console.error(errString)
            }
        }

        _inSubset(value) {
            return $.inArray(value, HeadingSubset) >= 0
        }

        _getHeadings() {
            // jQuery heading selector
            let $heads = $(HEADINGS.toString())

            // initialize the headings object
            let headings = {
                count: {},
                items: [],
                length: $heads.length,
                wellStructured: true
            }

            // iterate over every heading in DOM order
            $heads.each((i, heading) => {
                // get tag (h1-h6), level (1-6), and text
                let name = heading.tagName.toLowerCase()
                let level = parseInt(heading.nodeName.substr(1))
                let headingText = $(heading).text()

                // create item object
                let item = {
                    name: name,
                    level: level,
                    id: this._constructID(headingText),
                    classList: $(heading).attr('class') || null,
                    exclude: $(heading).hasClass(this.config.excludeClass),
                    contents: headingText
                }

                // move the level iterators forward
                Level.previous = Level.current
                Level.current = item.level

                // validate the heading
                let valid = this._validateHeading(item, heading)

                // one invalid heading makes the whole document poorly structured
                if (!valid) headings.wellStructured = false

                // wrap in sections if desired
                if (headings.wellStructured &&
                    this.config.sectionWrap &&
                    item.level >= this.config.start) {
                    this._sectionWrap(heading, item)
                }

                // create table of contents using the heading subset (h2-h4 by default)
                if (headings.wellStructured &&
                    this.config.createToC &&
                    this._inSubset(level)) {
                    // create table of contents (ToC) if desired
                    if (this.config.createToC) {
                        this._newToCItem(item)
                        this.toc = $(this.toc)[0]
                    }
                }

                // iterate the count
                if (typeof headings.count[name] === 'undefined') {
                    headings.count[name] = 1
                } else {
                    headings.count[name]++
                }

                // add the object to the array
                headings.items.push(item)
            })
            return headings
        }

        _createHeadingSubset() {
            $.each(HEADINGS, (i) => {
                let level = i + 1
                if (this.config.start <= level || typeof this.config.start === 'undefined') {
                    if (this.config.end >= level || typeof this.config.end === 'undefined') {
                        HeadingSubset.push(level)
                    }
                }
            })
            return true
        }

        _getPageIDs() {
            $('[id]').each((i, item) => {
                PageIDs.push($(item).attr('id'))
            })
            return true
        }

        _constructID(string) {
            let id = string.trim()
                // start with letter, remove apostrophes & quotes
                .replace(/^[^A-Za-z]*/, '').replace(/[‘’'“”"]/g, '')
                // replace all symbols with - except at the end
                .replace(/[^A-Za-z0-9]+/g, '-').replace(/-$/g, '').toLowerCase()

            // append a number if the id isn't unique
            if ($.inArray(id, PageIDs) >= 0) {
                let root = id
                let n = 0
                do {
                    n++
                    id = `${root}-${n}`
                } while ($.inArray(id, PageIDs) >= 0)
            }
            return id
        }

        _sectionWrap(el, item) {
            if (item.exclude && this.config.excludeAll) return true

            // create the section container
            let $section = $(document.createElement('section')).attr({
                id: item.id,
                class: 'section-container'
            })

            // replace the heading text with a non-tabbable anchor that
            // references the section
            let $anchor = $(document.createElement('a')).text(item.contents).attr({
                href: `#${item.id}`,
                tabindex: -1
            })
            $(el).html($anchor).addClass('heading-link')

            // wrap in the section container
            $(el).nextUntil(item.name).addBack().wrapAll($section)
        }

        _initToC() {
            let classStr = `${this.config.tocClass} ${this.config.tocClass}--h${this.config.start}`
            return $(document.createElement('ul'))
                .addClass(classStr)[0]
        }

        _newToCItem(item) {
            let li = this._createListItem(item)
            let depth = item.level - this.config.start
            if (this._inSubset(Level.previous)) Level.previousToc = Level.previous
            let change = item.level - Level.previousToc

            if (depth === 0) {
                Level.parent = this.toc
            } else if (change > 0) {
                let ul = $(document.createElement('ul'))
                    .addClass(`${this.config.tocClass}--${item.name}`)
                $(Level.parent).children().last().append(ul)
                Level.parent = ul
            } else if (change < 0) {
                Level.parent = $(Level.parent).parents().eq(Math.abs(change))
            }
            $(Level.parent).append(li)
        }

        _createListItem(item) {
            if (item.exclude) return
            return $(document.createElement('li'))
                .addClass(`${this.config.tocClass}__item`)
                .append($(document.createElement('a'))
                    .attr({
                        class: `${this.config.tocClass}__link`,
                        href: `#${item.id}`
                    })
                    .text(item.contents)
                )[0]
        }


        // static
        static init(config) {
            return new Segment(config)
        }

    }

    return Segment

})(jQuery)

export default Segment
