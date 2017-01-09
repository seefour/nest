'use strict'

import path from 'path'

export default function(gulp, p, browserSync, options) {
    const args = options.args
    const config = options.config
    const dirs = config.directories
    const dest = path.join(options.target, dirs.main, dirs.scripts.replace('_', ''))

    const modules = './node_modules'
    const bootstrap = path.join(modules, 'bootstrap-sass/assets/javascripts/bootstrap')

    const scripts = [
        // jQuery main entry
        path.join(modules, 'jquery/dist/jquery.js'),

        // Bootstrap plugins (comment out unused)
        // path.join(bootstrap, 'affix.js'),
        // path.join(bootstrap, 'alert.js'),
        // path.join(bootstrap, 'dropdown.js'),
        path.join(bootstrap, 'tooltip.js'),
        // path.join(bootstrap, 'modal.js'),
        path.join(bootstrap, 'transition.js'),
        // path.join(bootstrap, 'button.js'),
        path.join(bootstrap, 'popover.js'),
        // path.join(bootstrap, 'carousel.js'),
        // path.join(bootstrap, 'scrollspy.js'),
        // path.join(bootstrap, 'collapse.js'),
        path.join(bootstrap, 'tab.js')

        // path.join(modules, 'photoswiper/dist/photoswiper.browser.js')

        // PhotoSwipe and PhotoSwipe Default UI
        // path.join(photoswipe, 'photoswipe.js'),
        // path.join(photoswipe, 'photoswipe-ui-default.js')
    ]

    // Scripts
    return (done) => {
        gulp.src(scripts)
            .pipe(p.if(!args.production, p.sourcemaps.init({loadMaps: true})))
            // .pipe(p.babel({
            //     compact: false,
            //     presets: ['es2015']
            // }))
            .pipe(p.concat('vendor.js'))
            .pipe(p.if(args.production, p.uglify()))
            .on('error', p.notify.onError(config.notification))
            .pipe(p.if(!args.production, p.sourcemaps.write('./')))
            .pipe(gulp.dest(dest))
            .on('end', () => {
                browserSync.stream({
                    match: '**/*.js'
                })
                done()
            })
    }
}
