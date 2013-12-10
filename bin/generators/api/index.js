/**
 * Module dependencies
 */
var GeneratorFactory = require('../factory');




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
		async.auto({
			controller	: GeneratorFactory( 'controller' )(options),
			model		: GeneratorFactory( 'model' )(options)
		}, cb);
	}

};


