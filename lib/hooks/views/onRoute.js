/**
 * Module dependencies
 */

var _ = require('lodash');



/**
 * "Teach" router to understand direct references to views.
 *
 * @param {Sails} sails
 * @param {Object} route
 */

module.exports = function onRoute (sails, route) {
	var target = route.target,
		path = route.path,
		verb = route.verb,
		options = route.options;

	// Support { view: 'foo/bar' } notation
	if ( _.isPlainObject(target) ) {
		if (_.isString(target.view)) {
			return bindView(path, target, verb, options);
		}
	}

	// Ignore unknown route syntax
	// If it needs to be understood by another hook, the hook would have also received
	// the typeUnknown event, so we're done.
	return;

	/**
	 * Bind route to a view
	 *
	 * @param  {[type]} path    [description]
	 * @param  {[type]} target  [description]
	 * @param  {[type]} verb    [description]
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	function bindView ( path, target, verb, options ) {

		// Get view names
		var view = target.view.split('/')[0];
		var subview = target.view.split('/')[1] || 'index';

		// Look up appropriate view and make sure it exists
		var viewMiddleware = sails.middleware.views[view];
		// Dereference subview if the top-level view middleware is actually an object
		if (_.isPlainObject(viewMiddleware)) {
			viewMiddleware = viewMiddleware[subview];
		}

		// If a view was specified but it doesn't match,
		// ignore the attempt and inform the user
		if ( !viewMiddleware ) {
			sails.log.error(
				'Ignoring attempt to bind route (' +
				path + ') to unknown view: ' + target.view
			);
			return;
		}

		// Make sure the view function (+/- policies, etc.) is usable
		// If it's an array, bind each action to the destination route in order
		else if (_.isArray(viewMiddleware)) {
			_.each(viewMiddleware, function (fn) {
				sails.router.bind(path, viewHandler(fn), verb, _.extend(target, {log: 'VIEW'}));
			});
			return;
		}

		// Bind an action which renders this view to the destination route
		else {
			sails.router.bind(path, viewHandler(viewMiddleware), verb, _.extend(target, {log: 'VIEW'}));
			return;
		}


		// Wrap up the view middleware to supply access to
		// the original target when requests comes in
		function viewHandler (originalFn) {

			if ( !_.isFunction(originalFn) ) {
				sails.log.error(
					'Error binding view to route :: View middleware is not a function!',
					originalFn, 'for path: ', path, verb ? ('and verb: ' + verb) : '');
				return;
			}

			// Bind intercepted middleware function to route
			return originalFn;
		}
	}
};

