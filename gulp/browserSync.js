'use strict'

export default function(gulp, p, browserSync, options) {
    // BrowserSync
    return (done) => {
        browserSync.init({
            open: options.args.open ? 'local' : false,
            startPath: options.config.baseUrl,
            port: options.config.port || 3000,
            server: {
                baseDir: options.target,
                routes: (() => {
                    let routes = {}

                    // Map base URL to routes
                    routes[options.config.baseUrl] = options.target

                    return routes
                })()
            }
        })
        done()
    }
}
