/**
 * Dependencies
 */
var TemplateManifest = require('./fixtures/TemplateManifest');
var FileHeap = require('./fixtures/FileHeap');


before(function (cb) {
	
	/*
	 * Use an allocator to make it easier to manage files
	 * generated during testing
	 */
	this.heap = new FileHeap();


	/*
	 * Load template fixtures up front so they're accessible 
	 * throughout the generator tests.
	 */
	var self = this;
	TemplateManifest.load(function (err) {
		if (err) return err;
		self.templates = TemplateManifest;
		cb();
	});
});




after(function (cb) {

	/*
	 * Clean up loose files afterwards
	 */
	this.heap.cleanAll(cb);
});