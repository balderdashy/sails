var _ = require('lodash');
var util = require('sails-util');

/**
 * Expose `controllers` hook definition
 */
module.exports = function(sails) {

	var onRoute = require('./onRoute')(sails);

	return {

		defaults: {},

		// Don't allow sails to lift until ready is explicitly set below
		ready: false,

    configure: function () {
      sails.controllers = { };
    },

		/**
		 * Initialize is fired first thing when the hook is loaded
		 *
		 * @api public
		 */
		initialize: function(cb) {

			// Register route syntax for binding controllers.
			sails.on('route:typeUnknown', onRoute);

			// Load controllers from app and register their actions as middleware.
			this.loadAndRegisterControllers(cb);
		},

    explicitActions: {},

		/**
		 * Wipe everything and (re)load middleware from controllers. Merge any
     * controllers already defined in the sails.controllers namespace.
		 *
		 * @api private
		 */
		loadAndRegisterControllers: function(cb) {
			var self = this;

      // Remove all controllers from middleware hash,
      // but retain the reference between this and sails.middleware.controllers
      _.each(_.keys(self.middleware), function(key) {
        delete self.middleware[key];
      });

			// Load app controllers
			sails.modules.loadControllers(function modulesLoaded (err, modules) {

				if (err) return cb(err);

				sails.controllers = _.merge(sails.controllers, modules);

				// Register controllers
				_.each(sails.controllers, function(controller, controllerId) {

					// Override whatever was here before
					if ( !util.isDictionary(self.middleware[controllerId]) ) {
						self.middleware[controllerId] = {};
					}

					// Register this controller's actions
					_.each(controller, function(action, actionId) {

						// action ids are case insensitive
						actionId = actionId.toLowerCase();

						// If the action is set to `false`, explicitly disable it
						if (action === false) {
							delete self.middleware[controllerId][actionId];
							return;
						}

						// Ignore non-actions (special properties)
						//
						// TODO:
						// Some of these properties are injected by `moduleloader`
						// They should be hidden in the prototype or omitted instead.
						if (_.isString(action) || _.isBoolean(action)) {
							return;
						}

						// Otherwise mix it in (this will override CRUD blueprints from above)
            action._middlewareType = 'ACTION: '+controllerId+'/'+actionId;
						self.middleware[controllerId][actionId] = action;
            self.explicitActions[controllerId] = self.explicitActions[controllerId] || {};
            self.explicitActions[controllerId][actionId] = true;
					});

				});

				return cb();
			});
		}
	};
};
