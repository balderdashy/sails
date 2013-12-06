/**
 * Module dependencies
 */
var async = require('async');
var _ = require('lodash');
var checksum = require('checksum');


var TemplateManifest = function (){};

var _templates = {
	file: {
		path: 'test/fixtures/file.template'
	}
};

/**
 * Calculate checksums for each template
 * @param {Function} cb
 *		@param {Error} err
 *		@param {Object} templates
 */
TemplateManifest.load = function (cb) {
	async.each(Object.keys(_templates), function each (templateID, cb) {
		if (templateID === 'load') return cb(new Error('Invalid template id::', templateID));

		var template = _templates[templateID];
		checksum.file(template.path, function (err, sum) {
			if (err) return cb(err);
			template.checksum = sum;
			return cb();
		});
	}, function (err) {
		if (err) return cb(err);
		// Mix-in templates
		_.extend(TemplateManifest, _templates);
		return cb(err, _templates);
	});
};

module.exports = TemplateManifest;
