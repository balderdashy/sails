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
			sails.log.error('Invalid connection/adapter reference (' + connection + ') ' + 'in model (' + sourceModelId +')');
			return process.exit(1);
		},

		__UnknownConnection__: function (connectionId, sourceModelId) {
			sails.log.error('Unknown connection, "' + connectionId + '", referenced in model `' + sourceModelId + '`.');
			sails.log.error('Are you sure that connection exists?  It should be defined in `sails.config.connections`.');

			var probableAdapterModuleName = 'sails-' + connectionId.toLowerCase();
			sails.log.error('Otherwise, if you\'re trying to use an adapter named `' + connectionId + '`, please run ' +
				'`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
			return process.exit(1);
		}
	};

};
