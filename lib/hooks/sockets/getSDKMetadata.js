/**
 * Accept the socket handshake, and use the querystring to infer the
 * SDK platform, version, and programming language.
 * 
 * @param  {Object} handshake
 * @return {Object}
 */
module.exports = function (handshake) {
	var SDK_META_PARAMS = {
		version: '__sails_io_sdk_version',
		platform: '__sails_io_sdk_platform',
		language: '__sails_io_sdk_language'
	};

	// If metadata about the SDK version of the connecting client was not
	// provided in the version string, assume version = 0.9
	// (prior to 0.10, there wasn't any SDK versioning)
	if (!handshake.query[SDK_META_PARAMS.version]) {
		handshake.query[SDK_META_PARAMS.version] = '0.9.0';
	}

	return {
		version: handshake.query[SDK_META_PARAMS.version],
		platform: handshake.query[SDK_META_PARAMS.platform],
		language: handshake.query[SDK_META_PARAMS.language]
	};
};
