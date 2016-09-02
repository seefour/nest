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
