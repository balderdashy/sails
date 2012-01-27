//////////////////////////////////////////////////
// CRUD.io Javascript SDK
// c. Mike McNeil 2011-2012
//
//
//////////////////////////////////////////////////
(function () {
	var crud;

	CRUD = function (properties) {
		var defaults = { };
		_.defaults(this,defaults);
		_.defaults(this,properties);
		crud = this;
	}

	CRUD.prototype.read = function(node,success,error) {
		if (!node) node = "";
		crudRequest(this.server+"read/"+node,success,error);
	}


	CRUD.prototype.load = function(collection,success,error) {
		if (!collection) collection = "";
		crudRequest(this.server+"load/"+collection,success,error);
	}


	// Perform a JSONP request to CRUD.io server
	function crudRequest (url,success,error) {
		$.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback: "_crudio",
			cache: false,
			timeout: 5000,
			success: success || crud.success || defaultSuccess,
			error: error || crud.error || defaultError
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