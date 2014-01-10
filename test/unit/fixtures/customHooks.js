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
			identity: 'noop2',
			dependencies: 'noop'
		};
	},

	// Depends on 'noop' hook in both loadAfter and loadBefore
	NOOP3: function (sails) {
		return {
			identity: 'noop3',
			loadBefore: 'noop',
			loadAfter: 'noop'
		};
	},

	// Depends on 'noop5' hook in loadAfter
	NOOP4: function (sails) {
		return {
			identity: 'noop4',
			loadAfter: 'noop5'
		};
	},

	// Depends on 'noop4' hook in loadAfter
	NOOP5: function (sails) {
		return {
			identity: 'noop5',
			loadAfter: 'noop4'
		};
	},

	// Deliberately rotten hook- it's malformed.
	SPOILED_HOOK: true,

};