// Main javascript entry point
// - imports jQuery & Bootstrap plugins
// - initializes keyterm tooltips and PhotoSwipe images/galleries

'use strict';

import $ from 'jquery'

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

/* tota11y */
// import 'tota11y'

/* photoswipe initializer */
import '../_modules/swiper/swiper.js'
/* annotation (tooltips) initializer */
import Annotate from '../_modules/annotate/annotate.js'
import Segment from '../_modules/segment/segment.js'

$(() => {
    // initialize annotate (tooltips) with default options
    $('.keyterm').annotate()

    // initialize photoswipe galleries with default options
    $('.pswp-gallery').photoswipe()
})

export {Annotate, Segment}
