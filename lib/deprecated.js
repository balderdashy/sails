/**
 * Module dependencies
 */
var _ = require('lodash'),
	util = require('util');


//
// TODO: extrapolate to a submodule of `sails-stringfile`
//



// Used to detect terminal-URL support (for help links)
var IS_MACOS = require('os').platform().match(/darwin/);

function logMoreInfoLink (url, log) {
	log = log || console.log;
	if (IS_MACOS) {
		log('See '+util.format('%s'.underline, url));
		log('(⌘ + double-click to open link from terminal)'.grey);
	}
	else return log(util.format('(see %s)', url));
}

function logLinks (urls, log) {
	log = log || console.log;
		_.each(urls, function (url) {
			log(' ->',util.format('%s'.underline, url));
		});
	if (IS_MACOS) {
		log('    (⌘ + double-click to open links from terminal)'.grey);
	}
}

function logDeprecationNotice (feature, moreInfoURL, log) {
	log = log || console.log;
	console.log();
	log(util.format('Deprecated:   `%s`', feature).bold);
	if (moreInfoURL) logMoreInfoLink(moreInfoURL, log);
}


function logUpgradeNotice (template, values, log) {
	log = log || console.log;
	if (!_.isArray(values)) values = [values];
	log(util.format.apply(null, [template].concat(values)));
}


module.exports = {
	logMoreInfoLink: logMoreInfoLink,
	logLinks: logLinks,
	logUpgradeNotice: logUpgradeNotice,
	logDeprecationNotice: logDeprecationNotice
};