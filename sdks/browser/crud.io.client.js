//////////////////////////////////////////////////
// CRUD.io Javascript SDK
// c. Mike McNeil 2011-2012
//
//
//////////////////////////////////////////////////
(function () {

	CRUD = function (properties) {
		var defaults = { };
		_.defaults(this,defaults);
		_.defaults(this,properties);
	}


	CRUD.prototype.read = function(node,success,error) {
		if (!node) node = "";
		$.ajax({
			url: this.server+"read/"+node,
			dataType: "jsonp",
			jsonpCallback: "_crudio",
			cache: false,
			timeout: 5000,
			success: success || defaultSuccess,
			error: error || defaultError
		});
	}

	// Default error handling
	function defaultError(jqXHR, textStatus, errorThrown) {
		log('error ' + textStatus + " " + errorThrown);
		throw new Error(errorThrown);
	}

	// Default success callback handling
	function defaultSuccess(data) {
		log("Request successful, but no callback handler was specified.  Server said:",data);
	}

})();


//////////////////////////////////////////////////
// CRUD.io jQuery Plugin
// c. Mike McNeil 2011-2012
//
//
//////////////////////////////////////////////////
(function( $ ) {

	$.fn.crud = function(nodeName) {
		console.log("k");
		var el = $(this);

		CRUD.read(nodeName,function(data){
			el.text(data.content)
		});
	}

})(jQuery);