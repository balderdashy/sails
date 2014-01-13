/**
 * User entered an unknown or invalid command.
 *
 * Print out usage and stuff.
 */
module.exports = function( /* [msg1|options], [msg2], [msg3], [...] */ ) {
	var log = this.logger;
	var config = this.config;

	var args = Array.prototype.slice.call(arguments, 0),
		options = _.isPlainObject(args[0]) ? args[0] : null,
		messages = !_.isPlainObject(args[0]) ? args : args.splice(1);

	// If options were specified, it should contain the arguments
	// that were passed to the CLI.  Build the best error message
	// we can based on what we know.
	if (options) {
		if (!options.first) {
			messages.push('Sorry, I don\'t understand what that means.');
		} else messages.push('Sorry, I don\'t understand what `' + options.first + '` means.');
	}

	// Iterate through any other message arguments
	// and output a console message for each
	_.each(messages, function(msg) {
		log.error(msg);
	});

	// Finish up with an explanation of how to get more docs/information
	// on using the Sails CLI.
	log.info('To get help using the Sails command-line tool, run `sails`.');
};
