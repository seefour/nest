/**
 * --------------------------------------------------------------------------
 * Glossary (v1.0.0): glossary.js
 * Initialize your keyterms!
 * by Evan Yamanishi
 * NO LICENSE
 * --------------------------------------------------------------------------
 */

const Glossary = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'glossary'
    const VERSION = '1.0.0'
    const KEYTERMS_PATH = 'data/keyterms.json'

    const Default = {
        modifier: null,
        glossaryClass: 'glossary',
        marginal: true
    }

    const PAGE_TERMS = []

    const setupDocumentClick = (e) => {
        e = e || window.event
        let clickTarget = e.target || e.srcElement

        for (let item of PAGE_TERMS) {
            // account for bubbling
            let clickedItem = clickTarget === item.ref || item.ref.contains(clickTarget)
            if (!clickedItem) {
                item.keyterm.classList.remove('active')
                item.ref.removeAttribute('aria-describedby')
                $(item.ref).popover('hide')
            }
        }
    }

    const parseArgs = (el, config) => {
        let args = {}
        switch (typeof el) {
            case 'string':
                // el was just a selector
                args.elements = document.querySelectorAll(el)
                break;
            case 'object':
                // already a NodeList
                if (NodeList.prototype.isPrototypeOf(el)) {
                    args.elements = el
                // already an element
                } else if (el.nodeType === 1) {
                    // gently coerce into a NodeList
                    el.setAttribute('nodeListCoercion')
                    let newEls = document.querySelectorAll('[nodeListCoercion]')
                    el.removeAttribute('nodeListCoercion')
                    args.elements = newEls
                // el is probably the config
                } else if (config === undefined) {
                    args.elements = parseArgs(el.el).elements
                    args.config = el
                }
                break;
            default:
                throw new Error('Initialize with .init(selector, config)')
        }
        if (typeof config === 'object' && args.config === undefined) {
            args.config = config
        }
        return args
    }


    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    class Glossary {

        constructor(element, config) {
            this.isEnabled = true
            this.element = element
            this.config = this._getConfig(config)
            this.refID = this.element.getAttribute('data-href').substr(1)
            this.glossary = document.querySelector(`.${this.config.glossaryClass}`)

            this._setupGlossRef()
            this._getItemById(this.refID, (item) => {
                this.keyterm = this._constructTemplate(this.config.glossaryClass, item)
                this.glossary.appendChild(this.keyterm)
                PAGE_TERMS.push({
                    ref: this.element,
                    keyterm: this.keyterm
                })
                this._initTooltip(item)
                this._setupClickEvent()
            })

            return this
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

            this._pswp.destroy()

            this._isEnabled = null
            this._element = null
        }


        // private

        _getConfig(config) {
            return Object.assign({},
                Default,
                config
            )
        }

        _loadJSON(callback) {
            let xobj = new XMLHttpRequest()
            xobj.overrideMimeType('application/json')
            xobj.open('GET', KEYTERMS_PATH, true)
            xobj.onreadystatechange = function() {
                if (xobj.readyState == 4 && xobj.status == '200') {
                    callback(xobj.responseText)
                }
            }
            xobj.send(null)
        }

        _getItemById(id, callback) {
            this._loadJSON((data) => {
                let jsonData = JSON.parse(data)
                for (let item of jsonData) {
                    if (item.id === id) {
                        callback(item)
                    }
                }
            })
        }

        _positionKeyterm() {
            let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
            let rect = this.element.getBoundingClientRect()
            let parentTop = this.keyterm.parentElement.offsetTop
            let paddingTop = parseFloat(getComputedStyle(this.keyterm)['padding-top'])
            this.keyterm.style.top = `${rect.top + pageYScroll - parentTop - paddingTop}px`
        }

        _topPosition(element) {
            return
        }

        _setupGlossRef() {
            this.element.setAttribute('aria-controls', this.refID)
            this.element.setAttribute('id', `ref-${this.refID}`)
            this.element.href = this.element.getAttribute('data-href')
            this.element.removeAttribute('data-href')
        }

        _setupClickEvent() {
            this.element.addEventListener('click', (e) => this._elementClick(e))
        }

        _elementClick(e) {
            e = e || window.event
            e.preventDefault ? e.preventDefault() : e.returnValue = false
            let glossaryVisible = this._displayStyle(this.glossary) !== 'none'

            if (glossaryVisible) {
                if (this.config.marginal) this._positionKeyterm()

                if (!this.element.getAttribute('aria-describedby')) {
                    this.element.setAttribute('aria-describedby', this.refID)
                    this.keyterm.classList.add('active')
                } else {
                    this.element.removeAttribute('aria-describedby')
                    this.keyterm.classList.remove('active')
                }

                for (let item of PAGE_TERMS) {
                    if (this.keyterm !== item.keyterm) {
                        item.keyterm.classList.remove('active')
                        item.ref.removeAttribute('aria-describedby')
                    }
                }
            } else {
                $(this.element).popover('toggle')
            }
        }

        _displayStyle(element) {
            return element.currentStyle ? element.currentStyle.display : getComputedStyle(element, null).display
        }

        _initTooltip(item) {
            $(this.element).popover({
                html: true,
                placement: 'top auto',
                template: this._constructTemplate(this.config.glossaryClass),
                trigger: 'manual',
                title: item.term,
                content: item.description
            })
        }

        _constructTemplate(rootClass, item) {
            let template = document.createElement('div')
            template.className = `${rootClass}__item`
            template.setAttribute('role', 'tooltip')

            let dt = document.createElement('dt')
            dt.className = `${rootClass}__term`

            let backref = document.createElement('a')
            backref.className = 'backlink'

            dt.appendChild(backref)

            let dd = document.createElement('dd')
            dd.className = `${rootClass}__description`

            template.appendChild(dt)
            template.appendChild(dd)

            // setup for marginal annotations
            if (item) {
                template.setAttribute('id', this.refID)
                if (this.config.marginal) template.classList.add(`${rootClass}__item--marginal`)
                backref.innerHTML = item.term
                backref.setAttribute('href', `#${this.element.getAttribute('id')}`)
                dd.innerHTML = item.description

            // setup for bootstrap popovers
            } else {
                let arrow = document.createElement('div')
                arrow.className = 'arrow'
                template.insertBefore(arrow, template.firstChild)
                template.classList.add('popover')
                backref.classList.add('popover-title')
                dd.classList.add('popover-content')
            }

            return template
        }


        // static

        static initAll(selector, config) {
            let args = parseArgs(selector, config)
            return Array.from(args.elements).map((el, i) => {
                return new Glossary(el, args.config)
            })
        }

        static _jQueryInterface(config) {
            return this.each(function() {
                let data = $(this).data(DATA_KEY)
                let _config = typeof config === 'object' ?
                    config : null

                if (!data && /dispose|hide/.test(config)) {
                    return
                }

                if (!data) {
                    data = new Glossary(this, _config)
                    $(this).data(DATA_KEY, data)
                }

                if (typeof config === 'string') {
                    if (data[config] === undefined) {
                        throw new Error(`No method named "${config}"`)
                    }
                    data[config]()
                }
            })
        }
    }


    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = Glossary._jQueryInterface
    $.fn[NAME].Constructor = Glossary
    $.fn[NAME].noConflict = function() {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Glossary._jQueryInterface
    }
    // setup document event listener
    document.addEventListener('click', (e) => setupDocumentClick(e))

    return Glossary

})(jQuery)

export default Glossary
