/**
 * Retry a request up to *attempts* times
 */
function Nag(maxAttempts) {
	var me = this;

	this.maxAttempts = (maxAttempts) ? maxAttempts : 5;
	this.baseNagInterval = 250;

	this.nagInterval = this.baseNagInterval;
	this.attempts = 0;
	this.done = false;

	// Initialize nagging sequence
	this.start = function (request) {
		me.request = request;

		// Use a just-in-case timer to beat an inexplicable race condition
		// where user data is only fetched 9/10 times
		var nag = function () {
			if (!me.done) {
				Log.log("NAG: Retrying request...");
				me.request();
				me.attempts++;
				me.nagInterval*=2;
				if (me.attempts <= me.maxAttempts) {
					me.nagTimer = window.setTimeout(nag,this.nagInterval);
				}
				else {
					window.clearTimeout(me.nagTimer);
					me.fail();
				}
			}
		}

		// Initialize request
		me.nagTimer = window.setTimeout(nag, this.nagInterval);
		me.request();
	}

	// Pass this function as a response callback to end the nagging
	this.until = function (callback) {
		return function () {
			window.clearTimeout(me.nagTimer);
			if (!me.done) {
				me.done = true;
				callback.apply(this,arguments);
			}
		};
	}

	// Called when last attempt fails
	this.fail = function () {
		Log.log("NAG: All retries failed.");
	}
}
