
var TemplateManifest = require('./fixtures/TemplateManifest');
var FileHeap = require('./fixtures/FileHeap');



// Load template fixtures here so they're accessible below
before(function (cb) {
	var self = this;

	/**
	 * Use an allocator to make it easier to manage files
	 * generated during testing
	 */
	this.heap = new FileHeap();


	/**
	 * Load all generator templates up front
	 */
	TemplateManifest.load(function (err) {
		if (err) return err;
		self.templates = TemplateManifest;
		cb();
	});
});

// Clean up loose files afterwards
after(function (cb) {
	this.heap.cleanAll(cb);
});