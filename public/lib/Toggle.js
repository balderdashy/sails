/**
 * Toggle.js
 * Instead of using a boolean state variable, use this toggle thing.
 * 
 * Usage example (starts disabled):
 * function initalizor() {
 *   this.enabled = new Toggle(this.enable,this.disable)
 * }
 * 
 * function onUserClickedTheEnableControl() {
 *   this.enabled.toggle();
 * }
 */


var Toggle = function (startingState,onOn,onOff) {
	this.id = Math.random();
	this.on = startingState || this.defaults.on;
	this.onOn = onOn || this.defaults.onOn;
	this.onOff = onOff || this.defaults.onOff;
}



// Defaults
Toggle.prototype.defaults = {
	on:false,
	onOn: function defaultOnOn () {
		console && console.log && console.log("No onOn function specified for Toggle!");
	},
	onOff: function defaultOnOff () {
		console && console.log && console.log("No onOff function specified for Toggle!");
	}
}

// Toggle yourself
Toggle.prototype.toggle = function () {
	if (this.on) {
		this.setOff();
		this.onOff();
	}
	else {
		this.setOn();
		this.onOn();
	}
	return this;
}

Toggle.prototype.setOn = function () {
	this.on = true;
	
}

Toggle.prototype.setOff = function () {
	this.on = false;
}