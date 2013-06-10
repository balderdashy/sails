/**
 * Module dependencies.
 */

// global: sails

var _ = require( 'lodash' );


/**
 * Expose `bind` method.
 */

module.exports = bind;


/**
 * Bind new route(s)
 *
 * @param {String|RegExp} path
 * @param {String|Object|Array|Function} bindTo
 * @param {String} verb
 * @api private
 */

function bind ( path, target, verb ) {

	var log = this.log;

	// If path has an HTTP verb, parse it out
	var verbExpr = /^(get|post|put|delete|trace|options|connect|patch|head)\s+/i;
	var verbSpecifiedInPath = _.last(path.match(verbExpr) || []) || '';
	verbSpecifiedInPath = verbSpecifiedInPath.toLowerCase();

	// If a verb was specified, eliminate the verb from the path
	if (verbSpecifiedInPath) {
		path = path.replace(verbExpr,'');
	}
	
	// preserve the explicit verb argument if it was specified
	verb = verb || verbSpecifiedInPath;
	

	// Handle target chain syntax
	if (_.isArray(target)) {
		_.each(target, function (fn) {
			this.bind(path, fn, verb);
		}, this);

		return;
	}

	// Traditional object syntax (controller/action)
	if (_.isObject(target)) {
		
		// Use `controller` property to get the controller from the middleware cache
		var controller = sails.middleware[target.controller];
		if (controller) {

			// If specified, lookup the `action` function, otherwise lookup index
			var targetFn = controller[target.action || 'index'];

			// Bind the target action if it exists
			if (targetFn) {
				this.app[verb || 'all'](path, targetFn);

				return;
			}	
		}

		// If a controller was specified but it doesn't match, warn the user
		else if (target.controller) {
			log.error('Cannot bind route (' + path + ') to unknown target (' + target.controller + ')...');
		}

	}

	
	if (_.isString(target)) {

		// Handle dot notation
		var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);
		
		// If target matches something in the middleware registry
		// go ahead and assume that this is a dot notation route
		if (parsedTarget[1] && sails.middleware[parsedTarget[1]]) {

			return this.bind(path, {
				controller: parsedTarget[1],
				action: parsedTarget[2]
			}, verb);
		}

		// Otherwise if the target cannot be parsed as dot notation,
		// redirect requests to the specified string (which hopefully is a URL!)
		this.app[verb || 'all'](path, function (req, res) {
			log.verbose('Redirecting request (`' + path + '`) to `' + target + '`...');
			res.redirect(target);
		});

		return;
	}

	// Inline target function
	if (_.isFunction(target)) {
		this.app[verb || 'all'](path, target);

		return;
	}

	// If we make it here, the specified target property is invalid
	// No reason to crash the app in this case, so just ignore the bad route
	if (_.isObject(target)) {
		try {
			target = JSON.stringify(target);
		}
		catch (e) {}
	}

	log.error('Ignoring invalid attempt to bind route (' + path + ') to: ' + target);
}