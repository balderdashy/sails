// express.js
// --------------------
//
// Configuration for the encapsulated Express server

var express = require('express');
var _ = require('underscore');
var router = require('./router');
var fs = require('fs');

// Configure express server
exports.configure = function configure(cb) {

    // Define housing object for Express in the Sails namespace
    sails.express = {};

    // Configure express HTTP server
    if (sails.config.express.serverOptions) {
        sails.express.app = express.createServer(sails.config.express.serverOptions);
    }
    else sails.express.app = express.createServer();

    // Enable JSONP
    sails.express.app.enable("jsonp callback");

    sails.express.app.configure(function() {
        sails.express.app.set('views', sails.config.paths.views);
        sails.express.app.set('view engine', sails.config.viewEngine);
        sails.express.app.set('view options', {
            layout: sails.config.layout
        });

        // Route to error page
        sails.express.app.error(function(err, req, res, next) {
            var errors = _.isArray(errors) ? err : [err];

            // But augment response object first
            router.enhance(req,res,'error','error');

            require('./blueprints/error')(errors, req, res, next);
        });


        // Use body parser, if enabled
        if(sails.config.express.bodyParser) {
            sails.express.app.use(sails.config.express.bodyParser);
        }

        // TODO: Use 'accept-language' header to guess language settings
        var i18n = require('./i18n.js')(sails.locales);
        sails.express.app.use(i18n.init);

        var assets;

        // Development environment
        // Handle AND instantiate assets after each request
        if(sails.config.environment === 'development') {

            // Set up error handling
            sails.express.app.use(express.errorHandler({
                dumpExceptions: true,
                showStack: true
            }));

            // Provide access to asset compilation functions in views/layout
            assets = require('./assets').createAssets();
            _.each(sails.config.assets.sequence, function(dirname) {    
                require("fs-watch-tree").watchTree(dirname, function() {
                    assets = require('./assets').createAssets();
                });     
            });
            sails.express.app.use(function(req, res, next) {
                assets.handle(req, res, next);
            });
            
            afterwards();
        }
        // Production environemnt
        else if(sails.config.environment === 'production') {

            // Ignore errors in production
            sails.express.app.use(express.errorHandler());

            // Provide access to asset compilation functions in views/layout
            assets = require('./assets').createAssets();
            sails.express.app.use(assets);
            afterwards();
        }

        function afterwards(err) {

            // Allow access to static dirs

            // In production mode, 
            // configure access to public dir w/ a cache maxAge
            if(sails.config.environment === 'production') {

                sails.express.app.use(express['static'](sails.config.paths['public'], {
                    maxAge: sails.config.cache.maxAge
                }));
            }

            // In development mode, don't cache.
            else {
                sails.express.app.use(express['static'](sails.config.paths['public']));
            }

            // Use the specified cookieParser
            if(sails.config.express.cookieParser) {
                sails.express.app.use(sails.config.express.cookieParser);
            }

            // Connect session to express
            sails.express.app.use(express.session(sails.config.session));

            /**
             * Some handlebars specific methods.
             */
            sails.config.viewEngineModule
            if (sails.config.viewEngine === 'hbs' && typeof sails.config.viewEngineModule !== 'undefined') {
                var hbs = sails.config.viewEngineModule;
                
                /**
                 * Allow handlebars templates (hbs) to access asset-stack in templates with {{assets 'css'}}
                 * also map {{assets 'tpl'}} to assets.templateLibrary()
                 */
                hbs.registerHelper('assets', function(type) {
                    type = (type === 'tpl') ? 'templateLibrary' : type;
                    
                    /**
                     * Don't escape the html this outputs
                     */
                    return new hbs.handlebars.SafeString(assets[type]());
                });
                
                /**
                 * Allow output of errors with {{error errors}}
                 */
                hbs.registerHelper('error', function(context, options) {   
                    if (typeof context === 'array') {         
                        var out = "";
                        
                        for(var i=0, j=context.length; i<j; i++) {
                            out = out + options.fn(context[i]);
                        }
                        
                        return out;
                    }
                    else if( typeof context === 'object') {
                        var out = "";
                        
                        for(var i in context) {
                            out = out + options.fn(context[i]);
                        }
                        
                        return out;
                    }                
                });
                
                /**
                 * Allow handlebars partials in templates with {{> partialName}}
                 * 
                 * Shamelessly stolen from Ben Williamson (http://stackoverflow.com/a/12700409/745190)
                 */                
                var partialsDir = sails.config.paths.views + '/partials';
                
                
                fs.stat(partialsDir, function(err){                    
                    if (!err) {
                        console.log(partialsDir);
                        fs.readdir(partialsDir, function(err, filenames){
                            if (!err) {
                                filenames.forEach(function (filename) {
                                    if (!err) {
                                        var matches = /^([^.]+).hbs$/.exec(filename);
                                        if (!matches) {
                                            return;
                                        }
                                        var name = matches[1];
                                        var template = fs.readFile(partialsDir + '/' + filename, 'utf8', function(err, template){
                                            if (!err) {
                                                hbs.registerPartial(name, template);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        
                        
                    }
                })


                
                
                
            }

            // Add annoying Sails header instead of annoying Express header
            sails.express.app.use(function(req, res, next) {
                res.header("X-Powered-By", 'Sails <sailsjs.org>)');
                next();
            });

            // Allow usage of custom express middleware
            if(sails.config.express.customMiddleware) {
                sails.config.express.customMiddleware(sails.express.app);
            }

            // Allow full REST simulation for clients which don't support it natively
            // (by using _method parameter)
            if(sails.config.express.methodOverride) {
                sails.express.app.use(sails.config.express.methodOverride);
            }

            // Set up express router
            sails.express.app.use(sails.express.app.router);

            cb(err);
        }
    });
};
