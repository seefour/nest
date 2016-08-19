/**
 * --------------------------------------------------------------------------
 * Annotate (v1.0.0): annotate.js
 * A jQuery plugin for dynamically initializing semantic tooltips for
 * Norton ebooks using Bootstrap or jQueryUI
 * by Evan Yamanishi
 * NO LICENSE
 * --------------------------------------------------------------------------
 */

const Annotate = (($) => {

    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'annotate'
    const VERSION = '1.0.0'
    const NAMESPACE = 'nest'
    const DATA_KEY = `${NAMESPACE}.${NAME}`
    const JQUERY_NO_CONFLICT = $.fn[NAME]

    const Default = {
        dataFile: 'keyterms.json',
        type: 'keyterm',
        createGlossary: true,
        glossContainer: '.container',
        hiddenGlossary: true,
        vocab: 'epub'
    }

    const ClassName = {
        GLOSSARY: `${NAMESPACE}-glossary`,
        POPOVER: 'popover'
    }

    const Selector = {
        GLOSSARY: `.${ClassName.GLOSSARY}`
    }

    const Template = {
        base: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
        keyterm: '<dl class="popover" role="tooltip"><div class="arrow"></div><dt class="popover-title"></dt><dd class="popover-content"></dd></dl>'
    }


    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    class Annotate {

        constructor(element, config) {
            this._isEnabled = true
            this._element = element
            this._config = this._getConfig(config)
            this._id = $(this._element).attr('id')

            // add tabindex and role to anchors for accessibility
            this._fixAnchors()

            // do the magic
            this._handleItem()

            // set up a listener for enter/space bar activation
            this._accessibleListener()

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
            return $.extend({},
                this.constructor.Default,
                $(this._element).data(),
                config
            )
        }

        _loadJSON(callback) {
            $.ajax({
                url: `data/${this._config.dataFile}`,
                dataType: 'json',
                success: function(response) {
                    callback(response)
                }
            })
        }

        _handleItem() {
            this._loadJSON((data) => {
                $.each(data, (i, item) => {
                    if ($(this._element).attr('id') === item.id) {
                        if (this._config.createGlossary) this._createGlossary(item)
                        this._initTooltip(item)
                    }
                })
            })
        }

        _createGlossary(item) {
            if ($(Selector.GLOSSARY).length <= 0) {
                let h = (this._config.hiddenGlossary) ? 'hidden' : ''
                $(this._config.glossContainer).append(
                    $(document.createElement('aside')).addClass(h)
                        .append($(document.createElement('h2')).text('Glossary'))
                        .append($(document.createElement('dl')).addClass(ClassName.GLOSSARY))
                )
            }
            let $term = this._buildTerm(item.id, item.term)
            let $desc = this._buildDesc(item.description)
            $(Selector.GLOSSARY).append($term).append($desc)
        }

        _buildTerm(id, text) {
            return $(document.createElement('dt'))
                .addClass('glossterm')
                .append(
                    $(document.createElement('a'))
                        .html(text)
                        .attr({
                            class: 'backlink',
                            href: `#${id}`
                        })
                )
        }

        _buildDesc(html) {
            return $(document.createElement('dd'))
                .addClass('glossdef')
                .html(html)
        }

        _fixAnchors() {
            $(this._element).attr({
                role: 'button',
                tabindex: 0
            })
            return true
        }

        _accessibleListener() {
            $(this._element).on('keydown', (e) => {
                if (e.which === 13 || e.which === 32) {
                    e.preventDefault()
                    if ($(this._element).attr('aria-describedby')) {
                        $(this._element).popover('hide')
                    } else {
                        $(this._element).popover('show')
                    }
                }
            })

        }

        _initTooltip(content) {
            if (!content || content.length <= 0) {
                console.error('No tooltip found')
                return false
            }
            let template = this._constructTemplate(ClassName.POPOVER)

            let title = (this._config.type === 'keyterm') ? content.term : ''

            $(this._element).popover({
                html: true,
                placement: 'top auto',
                template: $(template).prop('outerHTML'),
                trigger: 'focus',
                title: title,
                content: content.description
            })
        }

        _constructTemplate(rootClass) {
            let template = $(Template[this._config.type]).clone()[0] || $(Template.base).clone()[0]
            let extraClass = this._getExtraClass()
            extraClass = (typeof extraClass === 'undefined') ? '' : ` ${extraClass}`
            $(template).addClass(`${rootClass}--${this._config.type}` + extraClass)
            return template
        }

        _getExtraClass() {
            if (typeof this._config.extraClass === 'function') {
                return this._config.extraClass.call(this._element)
            } else if (typeof this._config.extraClass === 'string') {
                return this._config.extraClass
            } else {
                let classList = this._element.getAttribute('class').split(/\s+/)
                for (var i = 0; i < classList.length; i++) {
                    if (classList[i].indexOf('--') >= 0) {
                        return classList[i].replace(/.+-{2}/g, '')
                    }
                }
            }
        }


        // static

        static _jQueryInterface(config) {
            let selector = this.selector
            return this.each(function() {
                let data = $(this).data(DATA_KEY)
                let _config = typeof config === 'object' ?
                    config : null

                if (!data && /destroy|hide/.test(config)) {
                    return
                }

                if (!data) {
                    data = new Annotate(this, _config)
                    data.selector = selector
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

        static init(selector, config) {
            if (typeof selector === 'object' &&
                typeof config === 'undefined') {
                    config = selector
                    selector = null
                }
            let s = selector || '.keyterm'
            $(s).annotate(config)
        }
    }


    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = Annotate._jQueryInterface
    $.fn[NAME].Constructor = Annotate
    $.fn[NAME].noConflict = function() {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Annotate._jQueryInterface
    }

    return Annotate

})(jQuery)

export default Annotate
