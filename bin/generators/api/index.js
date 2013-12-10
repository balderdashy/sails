/**
 * Module dependencies
 */
var GeneratorFactory = require('../factory');
var generateController = GeneratorFactory( 'controller' );
var generateModel = GeneratorFactory( 'model' );
var async = require('async');

var switcher = require('../../../util/switcher');


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

		console.log('generate api...', options);
		async.auto({
			controller	: function (cb) { generateController(options, cb); },
			model		: ['controller', function (cb) { generateModel(options, cb); }]
		}, function (err, async_data) {
			if (err) return cb(err);

			console.log('-->',options.generator);
			// Pass back self to allow logStatusOverride to be used
			return cb(null, options.generator);
		});
	},

	logStatusOverride: function (options, log) {
		var controllerGlobalID = options.id;
		var modelGlobalID = options.id;

		log('Created ' + controllerGlobalID + ' and ' + modelGlobalID + '.');
		log('REST API will be available next time you lift the server.');
		log('(@ `/' + options.id + '` with default settings)');
	}

};


