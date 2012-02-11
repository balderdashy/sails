var api = require('./services/api');
var _ = require('underscore');

// Set up routing table
exports.mapUrls = function mapUrls (app) {

    /**
     * Respond with content for a load context request
     * (update client cache)
     */
	function loadRequest(req, res) {

        // Get context based on request
        var context = api.getContext(req);

        // Look up content schema for this context
        api.getContentSchema(context, function (content){
            console.log("Answered read request.",content);

            // Return that information to crud client
            api.respond(content,req,res);
        });

    }
    app.get("/load*",loadRequest);
	app.get("/content/load*",loadRequest);


    /**
     * Respond to read request for a specific node
     */
	function readRequest(req, res) {

        // Get context based on request
        var context = api.getContext(req);

        // Look up content schema for this context
        api.getNode(context, function (content) {
            console.log("Answered read request.",content);

            // Return that infomration to crud client
            api.respond(content,req,res);
        });

    }
    app.get("/read*", readRequest);
    app.get("/content/read*", readRequest);
	
	
	/**
     * Fetch paginated/filtered list of content nodes for use in CMS
     */
    function fetchRequest (req, res) {

        // Look up content schema for this context
        api.fetch({
			page: req.param('page') || 0,
			max: req.param('max') || 15,
			offset: req.param('offset') || 0,
			sort: req.param('sort') || 'title',
			order: req.param('order') || 'desc'
		}, function (content){
            console.log("Answered fetch request.",content);

            // Return that information to crud client
            api.respond(content,req,res);
        });
    }
	app.get("/content/fetch*",fetchRequest);

}