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
		cb = switcher(cb);

		// Create two copies of the options, since they will be modified by the
		// controller and model generator functions
		_options = util.cloneDeep(options);
		options.controller = util.cloneDeep(_options);
		options.model = util.cloneDeep(_options);

		async.auto({
			controller	: function (cb) { generateController(options.controller, cb); },
			model		: function (cb) { generateModel(options.model, cb); }
		}, function (err, async_data) {
			if (err) return cb(err);

			return cb();
		});
	},

	logStatusOverride: function (options, log) {
		var controllerGlobalID = options.controller.globalID;
		var modelGlobalID = options.model.globalID;

		log('Created ' + controllerGlobalID + '.js and ' + modelGlobalID + '.js.');
		log('REST API will be available next time you lift the server.');
		log('(@ `/' + options.id + '` with default settings)');
	}

};


