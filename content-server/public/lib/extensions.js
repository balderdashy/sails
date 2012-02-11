// A few handy bits and pieces that are used throughout the application

////////////////////////////////////////////////////////////////////////////////
// Utilities / Extensions
////////////////////////////////////////////////////////////////////////////////

// Defeat IE8-'s aggressive caching of AJAX requests by using jQuery's
// built in cache-buster.  This addresses the same issue on Windows Phone 7.
$.ajaxSetup({
    cache: false
});


var util = {

	// takes either a jquery *input element* or string and copies it into a jquery element
	// hot, html escaped, and ready to work
	copyText: function (from,to) {
		var sourceText = (typeof from == "String")
		? from
		: from.val();
		to.text(sourceText);
		var replace = to.html().replace(/\n/g, '<br />');
		to.html(replace);
	},

	overrideEvent: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
		return false;
	}
}


var Log = {
	log: function(){
		if (!_.isUndefined(console) && !_.isUndefined(console.log)) {
			console.log(arguments);
		}
	}
};


/*
 *
 * Copyright (c) 2009 C. F., Wong (<a href="http://cloudgen.w0ng.hk">Cloudgen Examplet Store</a>)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * See details in: <a href="http://cloudgen.w0ng.hk/javascript/javascript.php">Javascript Examplet</a>
 *
 */
(function($) {
	$.fn.caret=function(options,opt2){
		var start,end,t=this[0];
		if(typeof options==="object" && typeof options.start==="number" && typeof options.end==="number") {
			start=options.start;
			end=options.end;
		} else if(typeof options==="number" && typeof opt2==="number"){
			start=options;
			end=opt2;
		} else if(typeof options==="string"){
			if((start=t.value.indexOf(options))>-1) end=start+options.length;
			else start=null;
		} else if(Object.prototype.toString.call(options)==="[object RegExp]"){
			var re=options.exec(t.value);
			if(re != null) {
				start=re.index;
				end=start+re[0].length;
			}
		}
		if(typeof start!="undefined"){
			if($.browser.msie){
				var selRange = this[0].createTextRange();
				selRange.collapse(true);
				selRange.moveStart('character', start);
				selRange.moveEnd('character', end-start);
				selRange.select();
			} else {
				this[0].selectionStart=start;
				this[0].selectionEnd=end;
			}
			this[0].focus();
			return this
		} else {
			if($.browser.msie){
				var val = this.val();
				var range = document.selection.createRange().duplicate();
				range.moveEnd("character", val.length)
				var s = (range.text == "" ? val.length : val.lastIndexOf(range.text));
				range = document.selection.createRange().duplicate();
				range.moveStart("character", -val.length);
				var e = range.text.length;
			} else {
				var s=t.selectionStart,
				e=t.selectionEnd;
			}
			var te=t.value.substring(s,e);
			return {
				start:s,
				end:e,
				text:te,
				replace:function(st){
					return t.value.substring(0,s)+st+t.value.substring(e,t.value.length)
				}
			}
	}
	return this;
}
})(jQuery);



/**
 * Auto-format phone numbers
 */
var PhoneNumber = {
	storeSubKey: function (event) {
		var field = $(this);
		var key   = event.keyCode;


		// This is a patch to allow select all for copying
		if (field.attr('subKey') == 17 && key == 65) {
			field.attr('selectAll', 1);
		} else {
			field.attr('subKey', key);
			field.attr('selectAll', 0);
		}
	},

	formatPhone: function (event) {
		var field  = $(this);
		var key    = event.keyCode;
		var caret  = $(this).caret().start;
		var number = field.val();

		if (field.attr('selectAll') == 1) {
			return;
		}

		// If within a valid display key, backspace, or delete
		if (key == -1 || key == 8 || key == 46 || key == 32 || (key >= 48 && key <= 111)) {
			// Strip out any non digit characters
			// We will pump our fancy chars back in but its easier to strip first
			var beforeCaret = number.substr(0, caret).replace(/[^\d]/g, '');
			var afterCaret  = number.substr(caret).replace(/[^\d]/g, '');
			number          = beforeCaret + afterCaret;

			// Update the caret if anything was stripped
			caret = beforeCaret.length;

			// If the user hits backspace on a fancy character, we need to remove a number
			if (key == 8 && field.attr('lastNumber') == number) {
				number = number.substr(0, caret - 1) + number.substr(caret);
				caret--;
			}

			// If the user hits delete on a fancy character, remove future number
			if (key == 46 && field.attr('lastNumber') == number) {
				number = number.substr(0, caret) + number.substr(caret + 1);
			}

			// Store the current number for checks with backspace and delete
			field.attr('lastNumber', number);

			// Don't allow them to start with a +1
			if (number.charAt(0) == '1') {
				number = number.substr(1);
				caret--;
			}

			// Over ten characters assume it is an extension
			if (number.length >= 11) {
				number = number.substr(0, 10) + ' #' + number.substr(10);
				if (caret >= 10) {
					caret += 2;
				}
			}

			// Once past the npa and nxx add a - then station
			if (number.length >= 6) {
				number = number.substr(0, 6) + '-' + number.substr(6);
				if (caret >= 6) {
					caret++;
				}
			}

			// Once a user starts, wrap in parenthesis and add a space
			if (number.length >= 1) {
				number = '(' + number.substr(0, 3) + ') ' + number.substr(3);
				if (caret >= 3) {
					caret += 3;
				} else {
					caret++;
				}
			}

			// Make sure the caret exists within the scope or it will be select all
			caret = Math.min(number.length, caret);

			// Update number
			field.val(number);
			field.caret(caret);
		}
	}
}





// Extend jquery to use a case-insensitive :contains
jQuery.expr[':'].iContains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};



// Add symmetric difference to underscore.js
_.subtract = function (array, other) {
	return _.filter(array, function(value) { return !_.include(other,value); });
}
_.symmetricDifference = function (array, other) {
	return _.union(_.subtract(array, other), _.subtract(other, array));
}


// Add reasonable difference method to backbone collection
Backbone.Collection = Backbone.Collection.extend({
//	difference: function (other) {
//		var newSet = [];
//		var idlist = _.pluck(other,'id');
//		this.each(function (model) {
//			if (!_.contains(idlist,model.id)) {
//				newSet.push(model);
//			}
//		});
//		return newSet;
//	}
	difference: function (other) {
		var these = this.models,
			those = other.models;
			
		var newSet = [];
		var idlist = _.pluck(those,'id');
		_.each(these,function (model) {
			if (!_.contains(idlist,model.id)) {
				newSet.push(model);
			}
		});
		return new Backbone.Collection(newSet);
	}
})



// Center an element in its container
jQuery.fn.center = function () {
	this.css("position","absolute");
	this.parent().css("position","relative");
//	this.css("top", ((this.parent().outerHeight() - this.outerHeight()) / 2) + "px");
	this.css("left", ((this.parent().outerWidth() - this.outerWidth()) / 2) + "px");
	return this;
}


// Query string parsing
function getQueryParameterByName(name) {

    var match = RegExp('[?&]' + name + '=([^&]*)')
                    .exec(window.location.search);

    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

// Fragment string parsing
function getFragmentParameterByName(name) {
    var match = RegExp('[#&]' + name + '=([^&]*)')
                    .exec(window.location.hash);

    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}