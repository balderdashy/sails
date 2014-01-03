/**
 * Dependencies
 */
var async = require('async');
// var TemplateManifest = require('./helpers/TemplateManifest');
var FileHeap = require('../helpers/FileHeap');
var __bin = '../../../bin';
var GenerateJSONFileHelper = require(__bin + '/generators/_helpers/jsonfile');


before(function (cb) {
	var self = this;
	
	/*
	 * Use an allocator to make it easier to manage files
	 * generated during testing
	 */
	self.heap = new FileHeap();

	/*
	 * Another file allocator made to look like a Sails app
	 * to test behavior with and without `--force`, inside
	 * and outside of a Sails project directory.
	 */
	self.sailsHeap = new FileHeap({
		path: '.tmp/someSailsApp/'
	});
	GenerateJSONFileHelper({
		pathToNew: self.sailsHeap.alloc('package.json'),
		data: {
			dependencies: {
				sails: '~99.9.99'
			}
		}
	}, { success: cb });


	/*
	 * Load template fixtures up front so they're accessible 
	 * throughout the generator tests.
	 */
	// var self = this;
	// TemplateManifest.load(function (err) {
	// 	if (err) return err;
	// 	self.templates = TemplateManifest;
	// 	cb();
	// });
});




after(function (cb) {

	/*
	 * Clean up loose files afterwards
	 */
	async.parallel([
		this.heap.cleanAll,
		this.sailsHeap.cleanAll,
	], cb);
});
