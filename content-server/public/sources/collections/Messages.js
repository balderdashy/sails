/*
 * Unwired Nation, Inc.
 *
 * NOTICE OF LICENSE
 *
 * This source file and any derivative works are 
 * subject to the Quick Start License Agreement that
 * is bundled with this package in the file QS-LICENSE.txt.
 *
 * It is also available through the world-wide-web at this URL:
 * http://unwirednation.com/legal/
 *
 * Copyright 2011, Unwired Nation, Inc.
 * http://unwirednation.com/
 */

var Messages = Rows.extend({
	model: Message
	
	// Disable client-side sorting
	,comparator: null
});

//var Messages = Backbone.Collection.extend({
//	model: Message,
//	url: null,
//	
//	// Flags for filtering, searching, and pagination
//	hasMore: false,
//	
//	
//	/**
//	 * Instead of blindly consuming JSON response from fetch,
//	 * look for the "data" key and absorb flags to signal whether
//	 * there are more pages of data available
//	 */
//	parse: function(data) {
//        if (!data) {
//            return []; 
//        }
//		else if (!data.data) {
//			Log.log("Data returned from server using old API.");
//			this.hasMore = false;
//			return data;
//		}
//		else {
//			this.hasMore = data.hasMore;
//			return data.data;
//		}
//    }
//
//	/**
//	 * Actually unnecessary since this is happening on the server.
//	 * Sort by modified or datesent, depending on what kind of collection this is
//	 */
////	,comparator: function(model) {
////		if (this.url == '/sentMessage')
////			return -model.get("dateSent");
////		else
////			return -model.get("dateModified");
////	}
//})