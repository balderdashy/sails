module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _		= require( 'lodash' ),
		async	= require( 'async' );


	/**
	 * Expose hook constructor
	 * 
	 * @api private
	 */

	return Hook;


	function Hook (definition) {


		/**
		 * Load the hook asynchronously
		 * 
		 * @api private
		 */

		this.load = function (cb) {

			var self = this;
		
			// Determine if this hook should load based on Sails environment & hook config
			if (	this.config.envs &&
					this.config.envs.length > 0 &&
					this.config.envs.indexOf(sails.config.environment) === -1) {
				return cb();
			}

			// Convenience config to bind routes before any of the static app routes
			sails.on('router:before', function () {
				_.each(self.routes.before, function (middleware, route) {
					sails.router.bind(route, middleware);
				});
			});

			// Convenience config to bind routes after the static app routes
			sails.on('router:after', function () {
				_.each(self.routes.after, function (middleware, route) {
					sails.router.bind(route, middleware);
				});
			});


			// Run configure and loadModules methods
			async.auto({
				
				configuration: function (cb) {
					if ( sails.config.hooks.userconfig ) {

						// Can't wait for `userconfig` if this IS `userconfig`!!
						// `moduleloader` cannot wait for userconfig.
						if ( self.identity === 'userconfig' || self.identity === 'moduleloader' ) {
							self.configure();
							return cb();
						}

						sails.after('hook:userconfig:loaded', function () {
							self.configure();
							cb();
						});
						return;
					}
					
					self.configure();
					return cb();
				},

				modules: function (cb) {

					// Can't wait for moduleloader if this IS moduleloader!!
					if ( self.identity === 'moduleloader' ) {
						return cb();
					}

					if (sails.config.hooks.moduleloader) {

						// Load modules
						sails.after('hook:moduleloader:loaded', function moduleloaderReady () {
							return self.loadModules(cb);
						});
						return;
					}
					
					return cb();
				}
			}, function (err) {
				if (err) return cb(err);

				// Call initialize() method if one provided
				if (self.initialize) { self.initialize(cb); }
				else cb();
			});

		};


		/**
		 * Default configuration for this hook
		 * (should be overiden by hook definition)
		 */
		this.defaults = function (config) {
			return {};
		};

		/**
		 * Normalize and validate configuration for this hook.
		 * Then fold modifications back into `sails.config`
		 *
		 * Hooks should override this function.
		 */
		this.configure = function () {
			// Mix-in defaults to sails.config
			util.merge( sails.config, this.defaults(sails.config), sails.config );
			return;
		};

		/**
		 * Hooks should override this function
		 */
		this.loadModules = function (cb) {
			return cb();
		};




		// Ensure that the hook definition has valid properties
		_normalize( this );
		definition = _normalize( definition );
			
		// Merge default definition with overrides in the definition passed in
		_.extend( definition.config, this.config, definition.config );
		_.extend( definition.middleware, this.middleware, definition.middleware );
		_.extend( definition.routes.before, this.routes.before, definition.routes.before );
		_.extend( definition.routes.after, this.routes.after, definition.routes.after );
		_.extend( this, definition );

		// Bind context of new methods from definition
		_.bindAll(this);

		

		/**
		 * Ensure that a hook definition has the required properties
		 * @api private
		 */

		function _normalize ( def ) {

			def = def || {};

			// Default hook config
			def.config = def.config || {};

			// list of environments to run in, if empty defaults to all
			def.config.envs = def.config.envs || [];

			def.middleware = def.middleware || {};

			// Default hook routes
			def.routes = def.routes || {};
			def.routes.before = def.routes.before || {};
			def.routes.after = def.routes.after || {};

			// Always set ready to true-- doesn't need to do anything asynchronous
			def.ready = true;

			return def;
		}
	}

};
