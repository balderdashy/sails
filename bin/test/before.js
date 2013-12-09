/**
 * Dependencies
 */
var TemplateManifest = require('./fixtures/TemplateManifest');
var FileHeap = require('./fixtures/FileHeap');
var GenerateJSONFileHelper = require('../generators/_helpers/jsonfile');



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
	self.sailsHeap = new FileHeap();
	GenerateJSONFileHelper({
		pathToNew: self.sailsHeap.alloc('package.json'),
		data: {
			dependencies: {
				sails: '~5.0.0'
			}
		}
	}, { ok: cb });


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
	this.heap.cleanAll(cb);
	this.sailsHeap.cleanAll(cb);
});