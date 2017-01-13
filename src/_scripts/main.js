// Main javascript entry point
// - imports jQuery & Bootstrap plugins
// - initializes keyterm tooltips and PhotoSwipe images/galleries

'use strict';

import $ from 'jquery'
window.$ = $

/* bootstrap plugins */
import 'bs.affix'
import 'bs.alert'
// import 'bs.dropdown.js'
import 'bs.tooltip.js'
import 'bs.modal.js'
import 'bs.transition.js'
import 'bs.button.js'
import 'bs.popover.js'
// import 'bs.carousel.js'
import 'bs.scrollspy.js'
import 'bs.collapse.js'
import 'bs.tab.js'

/* attach modules to the window scope for use in custom/*.js files */
// photoswipe initializer
import Swiper from './_modules/swiper/swiper.js'
window.Swiper = Swiper
// glossary (keyterms) initializer
import glossary from './_modules/glossary.js'


$(() => {
    // initialize glossary (keyterms) with default options
    glossary.initAll('[*|type~=glossref],[epub\\\:type~=glossref]')

    // initialize photoswipe galleries and figures with default options
    $('.pswp-gallery').photoswipe()
    $('.pswp-figure').photoswipe()
})
