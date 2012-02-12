var ApiService = require('./services/ApiService');
var _ = require('underscore');

// Set up routing table
exports.mapUrls = function mapUrls (app) {
	
	/**
     * Fetch paginated/filtered list of content nodes for use in CMS
     */
    function fetchRequest (req, res) {
        ApiService.fetch(req.query, function (content){
			
            // Return that information to crud client
            ApiService.respond(content,req,res);
        });
    }
	app.get("/content/fetch*",fetchRequest);
	
	

    /**
     * Respond with content for a load context request
     * (update client cache)
     */
	function loadRequest(req, res) {

        // Get context based on request
        var context = ApiService.getContext(req);

        // Look up content schema for this context
        ApiService.getContentSchema(context, function (content){
            console.log("Answered read request.",content);

            // Return that information to crud client
            ApiService.respond(content,req,res);
        });

    }
    app.get("/load*",loadRequest);
	app.get("/content/load*",loadRequest);


    /**
     * Respond to read request for a specific node
     */
	function readRequest(req, res) {

        // Get context based on request
        var context = ApiService.getContext(req);

        // Look up content schema for this context
        ApiService.getNode(context, function (content) {
            console.log("Answered read request.",content);

            // Return that infomration to crud client
            ApiService.respond(content,req,res);
        });

    }
    app.get("/read*", readRequest);
    app.get("/content/read*", readRequest);
}