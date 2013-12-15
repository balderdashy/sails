/**
 * Module dependencies
 */
var GeneratorFactory = require('../factory');
var generateController = GeneratorFactory( 'controller' );
var generateModel = GeneratorFactory( 'model' );
var async = require('async');
var switcher = require('sails-util/switcher');

var util = require('sails-util');


/**
 * Generate a Sails model + controller to enable a RESTful JSON blueprint API
 *
 * @property {Object} generators
 * @property {Array} requiredOptions
 * @property {Function} configure(options, sails, handlers)
 * @property {Function} render(options, handlers)
 * @property {Function} generate(options)
 *
 * @option {Boolean} id - the name for the new controller and model
 * @option {Array} attributes - names:types of the attributes
 */
module.exports = {

	/**
	 * If a required option is not specified, the generator will refuse to
	 * proceed until the error is corrected.
	 */
	requiredOptions: ['id'],


	/**
	 * Override generation logic
	 */
	generate: function (options, cb) {
		var handlers = switcher(cb);

		// Create two copies of the options, since they will be modified by the
		// controller and model generator functions
		_options = util.cloneDeep(options);
		options.controller = util.cloneDeep(_options);
		options.model = util.cloneDeep(_options);

		async.auto({
			controller : function (cb) {
				generateController(
					options.controller,
					asyncify(cb, ['alreadyExists'])
				);
			},
			model : function (cb) {
				generateModel(
					options.model,
					asyncify(cb, ['alreadyExists'])
				);
			}
		}, unasyncify(handlers));
	},



	logStatusOverride: function (options, log) {
		var controllerGlobalID = options.controller.globalID;
		var modelGlobalID = options.model.globalID;

		log('Created ' + controllerGlobalID + '.js and ' + modelGlobalID + '.js.');
		log('REST API will be available next time you lift the server.');
		log('(@ `/' + options.id + '` with default settings)');
	}

};






/**
 * Module dependencies
 */
var _ = require('lodash');



/**
 * Generates an `async.auto` callback which smuggles a hidden property 
 * indicating the origin handler.  Always "breaks" the async.auto block,
 * since it will be seen as an error.
 * 
 * @param  {Function} cb [an async.auto callback]
 */
function _packCb (handlerName, cb) {
	return function _originalHandler () {
		var args = Array.prototype.slice.call(arguments);
		var originalFirstArgument = args[0];
		args[0] = {
			originalFirstArgument: originalFirstArgument,
			_$_handlerName: handlerName
		};
		return cb.apply(cb, args);
	};
}


/**
 * The function returned by unasyncify, the "_negotiator", 
 * requires that `asyncify` was used in the async callback which 
 * triggered it (in order for the extra argument to be prepended).
 * 
 * @returns {Function} `asyncify/async.auto`-compatible "final callback"
 */
function unasyncify (handlers) {
	return function _negotiator (packedErr, async_data) {
		if (!packedErr) {
			if (!handlers.success) return handlers('unasyncify() could not unpack async.auto object!  (no success handler defined)');
			return handlers.success(async_data);
		}
		if (!packedErr._$_handlerName) return handlers('unasyncify() could not unpack async.auto object!  (missing handlerName)');

		var handler = handlers[packedErr._$_handlerName] || handlers.error;
		return handler(packedErr.originalFirstArgument, async_data);
	};
}

/**
 * Transforms a handlers object into an `async.auto`-compatible callback.
 *
 * Supports `success`, `error`, and `invalid` by default.  Additional
 * handlers can be added by specifying them as an array (second argument).
 *
 * @returns switcher-compatible `handlers` object
 */
function asyncify (async_cb, additionalHandlerNames) {
	
	// Default handlers
	var handlers = ['success', 'error', 'invalid'];

	// Mix-in additional handlers (default to `error` handler)
	handlers = handlers.concat(additionalHandlerNames || []);
	
	// Build handlers object
	return _.reduce(handlers, function buildHandler ( memo, nextHandlerName ) {
		if (nextHandlerName === 'success') memo.success = function (result) {return async_cb(null, result);};
		else memo[nextHandlerName] = _packCb(nextHandlerName, async_cb);
		return memo;
	}, {});
}

