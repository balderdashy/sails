/**
 * CRUD.io
 * Browser SDK
 * c. Michael McNeil 2012
 *
 * TODO: Use a localStorage cache to store non-secure requests to
 *		the Content Cloud.  Only refresh a node if it goes stale.
 *
 */
(function () {
	
	CRUD = constructor;

	/**
	 * Request a node from the Content Cloud.
	 *
	 * NOTE:
	 * This is a safe way of accessing the functionality of CRUD.get, since
	 * it prevents accessing nodes which were not already fetched on CRUD.io's
	 * initialization.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	CRUD.prototype.read = function(node,success,error) {
		if (!node) node = "";
		crudRequest(this.server+"read/"+node,success,error);
	}

	/**
	 * Request a node from the Content Cloud.
	 *
	 * WARNING:
	 * Make sure you're only accessing nodes which are included in this
	 * page, collection or layout.  Otherwise, this is an inefficient method
	 * of accessing data since you're hitting your Content Cloud for each
	 * payload.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	CRUD.prototype.get = function(node,success,error) {
		if (!node) node = "";
		crudRequest(this.server+"read/"+node,success,error);
	}

	/**
	 * Called automatically during the initialization.
	 * Loads applicable nodes from the Content Cloud.
	 *
	 * @param <type> $node
	 * @param <type> $dontEcho
	 * @return <type>
	 */
	CRUD.prototype.load = function(collection,success,error) {
		if (!collection) collection = "";
		crudRequest(this.server+"load/"+collection,success,error);
	}

	///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////

	// Construct a CRUD.io client instance
	function constructor (properties) {
		var defaults = { };
		_.defaults(this,defaults);
		_.defaults(this,properties);
		this.cache = {};
	}

	// Perform a JSONP request to CRUD.io server
	CRUD.prototype.crudRequest = function (url,success,error) {
		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback: "_crudio",
			cache: false,
			timeout: 5000,
			success: success || this.success || defaultSuccess,
			error: error || this.error || defaultError
		});
	}

	// Default error handling
	function defaultError(jqXHR, textStatus, errorThrown) {
		log('error ' + textStatus + " " + errorThrown);
		throw new Error(errorThrown);
	}

	// Default success callback handling
	function defaultSuccess(data) {
		log("No callback handler was specified, but I'll tell you what the server said anyway:",data);
	}

})();


//////////////////////////////////////////////////
// CRUD.io jQuery Plugin
// c. Mike McNeil 2011-2012
//
//
//////////////////////////////////////////////////
//(function( $ ) {
//
//	$.crud = function (configuration) {
//		if (configuration && configuration.server) {
//			$.crud.server = configuration.server;
//		}
//		else {
//			throw new Error ('No server URL specified in configuration!');
//		}
//	}
//
//	$.fn.crud = function(nodeName) {
//		var el = $(this);
//
//		$.crud.read(nodeName,function(data){
//			el.text(data.content)
//		});
//	}
//
//})(jQuery);