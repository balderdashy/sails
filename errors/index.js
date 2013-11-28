// Merge together error sub-modules
module.exports = {
	fatal: require('./fatal'),
	warn: require('./warn'),
	runtime: require('./runtime')
};
