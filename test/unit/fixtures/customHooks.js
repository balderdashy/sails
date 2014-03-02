/**
 * Stub custom hooks for use in tests.
 * 
 * @type {Object}
 */
module.exports = {

	// Extremely simple hook that doesn't do anything.
	NOOP: function (sails) { 
		return { identity: 'noop' };
	},
	
	// Depends on 'noop' hook
	NOOP2: function (sails) {
		return {
			// TODO: indicate dependency on 'noop' hook
			identity: 'noop2'
		};
	},

	// Deliberately rotten hook- it throws.
	SPOILED_HOOK: function (sails) {
		throw new Error('smells nasty');
	}
};