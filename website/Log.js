var Log = {
	log: function(){
		if (!_.isUndefined(console) && !_.isUndefined(console.log)) {
			console.log(arguments);
		}
	}
};