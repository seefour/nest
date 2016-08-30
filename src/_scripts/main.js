// Main javascript entry point
// - imports jQuery & Bootstrap plugins
// - initializes keyterm tooltips and PhotoSwipe images/galleries

'use strict';

import $ from 'jquery'
window.$ = $

/* bootstrap plugins */
import 'bs-affix'
import 'bs-alert'
// import 'bs-dropdown'
import 'bs-tooltip'
import 'bs-modal'
import 'bs-transition'
import 'bs-button'
import 'bs-popover'
// import 'bs-carousel'
import 'bs-scrollspy'
import 'bs-collapse'
import 'bs-tab'

/* photoswipe initializer */
window.Swiper = require('../_scripts/_modules/swiper/swiper.js')

/* annotation (tooltips) initializer. made available to window */
window.Annotate = require('../_scripts/_modules/annotate/annotate.js')

/* segment initializer. made available to window */
window.Segment = require('../_scripts/_modules/segment/segment.js')

$(() => {
    // initialize annotate (tooltips) with default options
    $('.keyterm').annotate()

    // initialize photoswipe galleries and figures with default options
    $('.pswp-gallery').photoswipe()
    $('.pswp-figure').photoswipe()
})
