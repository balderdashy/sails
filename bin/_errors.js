module.exports = {

	badLocalSailsVersion: function (requiredVersion) {
		return new Error('You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').');
	}
};