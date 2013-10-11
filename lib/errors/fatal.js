/**
 * Fatal Errors
 */


module.exports = function(sails) {

	return {

		__UnknownPolicy__: function (policy, source) {
			source = source || 'config.policies';

			sails.log.error('Unknown policy, "' + policy + '", referenced in `' + source + '`.');
			sails.log.error('Are you sure that policy exists?');
			sails.log.error('It would be located at: `' + sails.config.paths.policies + '/' + policy + '.js`');
			return process.exit(1);
		},

		__InvalidConnection__: function (connection, sourceModelId) {
			sails.log.error('In model (' + sourceModelId +'), invalid connection ::', connection);
			sails.log.error('Must contain an `adapter` key referencing the adapter to use.');
			return process.exit(1);
		},

		__UnknownConnection__: function (connectionId, sourceModelId) {
			sails.log.error('Unknown connection, "' + connectionId + '", referenced in model `' + sourceModelId + '`.');
			sails.log.error('Are you sure that connection exists?  It should be defined in `sails.config.connections`.');
			return process.exit(1);
		},

		__UnknownAdapter__: function (adapterId, sourceModelId) {
			var mainMsg = 'Trying to use unknown adapter, "' + adapterId + '"';
			if (sourceModelId) {
				mainMsg += ' in model `' + sourceModelId + '`.';
			}
			sails.log.error(mainMsg);
			sails.log.error('Are you sure that adapter is installed in this Sails app?');
			sails.log.error('If you wrote a custom adapter with identity="' + adapterId + '", it should be in this app\'s adapters directory.');

			var probableAdapterModuleName = adapterId.toLowerCase();
			if ( ! probableAdapterModuleName.match(/^(sails-|waterline-)/) ) {
				probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
			}
			sails.log.error('Otherwise, if you\'re trying to use `' + adapterId + '` from npm, please run ' +
				'`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
			return process.exit(1);
		},

		__InvalidAdapter__: function (attemptedModuleName, supplementalErrMsg) {
			sails.log.error('There was an error attempting to require("' + attemptedModuleName + '")');
			sails.log.error('Is this a valid Sails/Waterline adapter?  The following error was encountered ::');
			sails.log.error(supplementalErrMsg);

			return process.exit(1);
		}
	};

};
