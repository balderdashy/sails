

// // NOT COMPLETE


// // i18n.js
// // --------------------
// //
// // Internationalization and locales configuration and core logic

// var i18n = require('i18n');
// var _ = require('lodash');


// // TODOS: Get locales

// module.exports = function(locales) {

// 	// Internationalization
// 	i18n.configure({
// 		// setup some locales - other locales default to en silently
// 		locales: _.keys(locales || {}),

// 		// where to register __() and __n() to, might be "global" if you know what you are doing
// 		register: global
// 	});

// 	return i18n;
// };




// // --------------------
// // Middleware:
// // --------------------

// // TODO: Use 'accept-language' header to guess language settings
// var i18n = require('../configuration/i18n')(sails.locales);
// sails.express.app.use(i18n.init);