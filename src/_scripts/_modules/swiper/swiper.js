/**
 * --------------------------------------------------------------------------
 * Swiper (v1.0.2): swiper.js
 * A jQuery plugin for easy and accessible PhotoSwipe initialization
 * by Evan Yamanishi
 * Licensed under GPL-3.0
 * --------------------------------------------------------------------------
 */
import PhotoSwipe from 'PhotoSwipe'
import PhotoSwipeUIDefault from 'PhotoSwipeUIDefault'
import 'tabtrap'

const Swiper = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME               = 'photoswipe'
    const VERSION            = '1.0.3'
    const DATA_KEY           = 'pswp.gallery'
    const EVENT_KEY          = `.${DATA_KEY}`
    const CLASS_KEY          = `.${DATA_KEY.replace('.', '-')}`
    const JQUERY_NO_CONFLICT = $.fn[NAME]

    const Default = {
        rootClass: CLASS_KEY,   // '.pswp-gallery'
        // use tabtrap.js dependency to handle focus accessibility
        tabtrap: true,

        // PhotoSwipe options
        showHideOpacity: true,
        showAnimationDuration: 350, // match Bootstrap TRANSITION_DURATION
        hideAnimationDuration: 350,
        bgOpacity: 0.7,

        // PhotoSwipeUI_Default OPTIONS
        shareEl: false
    }

    const Selector = {
        // PhotoSwipe UI elements
        PSWP     : '.pswp',
        BUTTON   : '.pswp__button',
        INFO     : '.pswp__button--info',
        NEXT     : '.pswp__button--next',
        PREVIOUS : '.pswp__button--previous',

        // figure>(a>img)+figcaption
        FIGURE  : 'figure',
        LINK    : 'a[data-href],a[href]',
        THUMB   : 'img',
        CAPTION : 'figcaption'
    }

    const pswpEl = $(Selector.PSWP)[0]

    const Event = {
        CLICK_ANCHOR    : `click.anchor${EVENT_KEY}`,
        CLICK_BUTTON    : `click.button${EVENT_KEY}`,
        CLICK_THUMBNAIL : `click.thumbnail${EVENT_KEY}`
    }

    // Attributes that shouldn't be added to the PhotoSwipe item object
    const Ignore = [
        'class',
        'data-size',
        'data-href',
        'href',
        'src'
    ]


    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    class Swiper {

        constructor(element, config) {
            this._isEnabled     = true
            this._element       = element
            this._config        = this._getConfig(config)
            this._selectorIndex = this._galleryIndex()
            this._isGallery     = this._isGallery()

            let params = this._parseHash(window.location.hash.substring(1))
            this._openFromParameters(params, true)

            this._setClickListeners()
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

        static get Event() {
            return Event
        }

        static get EVENT_KEY() {
            return EVENT_KEY
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

            this._isEnabled     = null
            this._element       = null
            this._selectorIndex = null
            this._config        = null
            this._items         = null
            this._pswp          = null
        }


        // private

        _getConfig(config) {
            return $.extend({},
                this.constructor.Default,
                $(this._element).data(),
                config
            )
        }

        _galleryIndex() {
            return parseInt($(this._element).attr('data-pswp-uid'), 10)
        }

        _isGallery() {
            return $(this._element).children(Selector.FIGURE).length ? true : false
        }

        _parseHash(hash) {
            let params = {}

            let vars = hash.split('&')
            for (let i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue
                }
                let pair = vars[i].split('=')
                if (pair.length < 2) {
                    continue
                }
                let int = parseInt(pair[1])
                params[pair[0]] = isNaN(int) ? pair[1] : int
            }

            if (params.gid && params.pid) {
                return params
            } else {
                return false
            }
        }

        _setClickListeners() {
            $(this._element).on(Event.CLICK_THUMBNAIL, 'a', (event) => {
                let link = event.currentTarget

                if ($(link).children(Selector.THUMB).length !== 1) return false

                let figure = $(link).parent(Selector.FIGURE)[0]
                let index  = this._isGallery ?
                    $(this._element).children(Selector.FIGURE).index(figure) :
                    0

                this._triggerEl = link

                if (index >= 0 && this._isEnabled) {
                    event.preventDefault()
                    this._openPhotoswipe(index, false)
                }
            })

            $(document).on(Event.CLICK_ANCHOR, Selector.LINK, (event) => {
                let params = this._parseHash($(event.target).attr('href'))
                if (params) {
                    event.preventDefault()
                    this._triggerEl = event.target
                    this._openFromParameters(params, false)
                }
            })
        }

        _openFromParameters(params, fromURL) {
            if (params.gid === this._selectorIndex) {
                let index = this._isGallery ? params.pid - 1 : 0
                this._openPhotoswipe(index, fromURL)
            }
        }

        _openPhotoswipe(index, fromURL) {
            this._items = this._buildItems()
            let options = this._getOptions(index)

            if (fromURL) options.showAnimationDuration = 0

            // hide the arrow navigation buttons if the gallery is one image
            if (!this._isGallery) {
                $(`${Selector.NEXT}, ${Selector.PREVIOUS}`)
                    .addClass('pswp__element--disabled').attr('tabindex', -1)
            } else {
                $(`${Selector.NEXT}, ${Selector.PREVIOUS}`)
                    .removeClass('pswp__element--disabled').attr('tabindex', '')
            }

            this._pswp = new PhotoSwipe(pswpEl, PhotoSwipeUIDefault, this._items, options)
            this._pswp.init()
            // this._setAlt()
            this._manageFocus()
            this._manageUI()
            return this._pswp
        }

        _buildItems() {
            let items   = []
            let $figure = this._isGallery ?
                        $(this._element).find(Selector.FIGURE) :
                        $(this._element)

            for (let i = 0; i < $figure.length; i++) {
                let item = this._getItem($figure[i])
                items.push(item)
            }

            return items
        }

        _getItem(figure) {
            let link  = $(figure).find(Selector.LINK)[0]
            let thumb = $(figure).find(Selector.THUMB)[0]
            let cap   = $(figure).find(Selector.CAPTION)[0]

            let size = $(link).attr('data-size').split('x')
            let item = {
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10),
                src: $(link).attr('data-href') || $(link).attr('href')
            }

            let linkAts  = $(link.attributes)
            for (let i = 0; i < linkAts.length; i++) {
                if ($.inArray(linkAts[i].name, Ignore) === -1) {
                    item[linkAts[i].name] = linkAts[i].value
                }
            }

            let thumbAts = $(thumb.attributes)
            for (let i = 0; i < thumbAts.length; i++) {
                if ($.inArray(thumbAts[i].name, Ignore) === -1) {
                    item[thumbAts[i].name] = thumbAts[i].value
                }
            }

            if ($(cap).html().length > 0) {
                item.title = $(cap).html()
            }

            if (!this._isGallery) {
                item.pid = (item.src.split('/').pop()).split('.').shift()
            }

            item.fig = figure

            return item
        }

        _getOptions(index) {
            return $.extend({},
                this._config, {
                    index: index,
                    galleryUID: this._selectorIndex,
                    galleryPIDs: this._isGallery ? false : true,
                    getThumbBoundsFn: (i) => {
                        let thumbnail = $(this._items[i].fig).find('img')[0]
                        return {
                            x: $(thumbnail).offset().left,
                            y: $(thumbnail).offset().top,
                            w: $(thumbnail).width()
                        }
                    }
                }
            )
        }

        _manageFocus() {
            if (this._config.tabtrap) {
                $(pswpEl).tabtrap({
                    disableOnEscape: false
                })
                $(document).on('tab.a11y.tabtrap', $(pswpEl), () => {
                    $(pswpEl).find('.pswp__ui').removeClass('pswp__ui--idle')
                })
            }

            this._pswp.listen('close', () => {
                let current = this._pswp.getCurrentIndex()
                let activeFigure = this._isGallery ?
                    $(this._element).children(Selector.FIGURE).eq(current)[0] :
                    this._element

                // return focus appropriately
                if ($.contains(this._element, this._triggerEl) || this._triggerEl === undefined) {
                    // to the currently active figure if the triggering click
                    // came from one of the figures in the gallery
                    $(activeFigure).find(Selector.LINK).focus()
                } else {
                    // to the triggering element otherwise
                    $(this._triggerEl).focus()
                }
            })
        }

        _manageUI() {
            $(pswpEl).on(Event.CLICK_BUTTON, Selector.BUTTON, (event) => {
                let button = event.currentTarget
                if ($(button).hasClass('pswp__button--next')) this._pswp.next()
                if ($(button).hasClass('pswp__button--previous')) this._pswp.prev()
            })
        }

        // disabled for now
        /* _setAlt() {
            this._pswp.listen('beforeChange', () => {
                let current = this._pswp.getCurrentIndex()
                let altText = (this._items[current].alt) ? this._items[current].alt : ''
                let longDesc = (this._items[current]['data-desc']) ? this._items[current]['data-desc'] : ''
                let $alt = $(document.createElement('div'))
                    .append($(document.createElement('div'))
                        .text(altText)
                    )
                    .append($(document.createElement('div'))
                        .html(longDesc)
                    )
                $(this._config.DESCRIPTION).html($alt.html())
            })
        } */


        // static

        static _jQueryInterface(config) {
            let count = $('[data-pswp-uid]').length
            return this.each(function(i) {
                $(this).attr('data-pswp-uid', i + count + 1)

                let data = $(this).data(DATA_KEY)
                let _config = typeof config === 'object' ?
                    config : null

                if (!data && /destroy|hide/.test(config)) {
                    return
                }

                if (!data) {
                    data = new Swiper(this, _config)
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

    $.fn[NAME]             = Swiper._jQueryInterface
    $.fn[NAME].Constructor = Swiper
    $.fn[NAME].noConflict  = function() {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Swiper._jQueryInterface
    }

    return Swiper

})(jQuery)

export {Swiper as default, PhotoSwipe}
