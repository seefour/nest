// Main javascript entry point
// - imports jQuery & Bootstrap plugins
// - initializes keyterm tooltips and PhotoSwipe images/galleries

'use strict';

import './_modules/globals.js'
import 'bootstrap'

const $ = jQuery

/* bootstrap plugins */
// import 'bs.util'
// import 'bs.alert'
// import 'bs.button'
// // import 'bs.carousel'
// import 'bs.collapse'
// // import 'bs.dropdown'
// import 'bs.modal'
// import 'bs.scrollspy'
// import 'bs.tab'
// // import 'bs.tooltip'
// // import 'bs.popover'

// photoswipe initializer
import Swiper from './_modules/swiper/swiper.js'
window.Swiper = Swiper

// annotate (tooltips) initializer
import Annotate from './_modules/annotate/annotate.js'
window.Annotate = Annotate

// segment initializer
import Segment from './_modules/segment/segment.js'
window.Segment = Segment

$(() => {
    // initialize annotate (tooltips) with default options
    $('.keyterm').annotate()

    // initialize photoswipe galleries and figures with default options
    $('.pswp-gallery').photoswipe()
    $('.pswp-figure').photoswipe()
})
