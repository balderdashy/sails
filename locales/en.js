/**
 * English stringfile for output messages in the Sails runtime & command-line tool.
 * 
 * @type {Object}
 */
module.exports = {

	cli: {
		new: {
			success: 'Created a new sails app `%s` at %s.', // [ appName, appPath ]
			missingAppName: 'Please choose the name or destination path for your new app.'
		},
		invalid: 'Sorry, I don\'t understand what that means.',
		toGetHelp: 'To get help using the Sails command-line tool, run:\n` $ sails --help `'
	},

	core: {}
};
