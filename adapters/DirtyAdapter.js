var _ = require('underscore');

var dirtyAdapter = require('waterline-dirty');

dirtyAdapter = _.extend(dirtyAdapter,{
	config: _.extend(dirtyAdapter.config, {
		inMemory: false
	})
});

exports = _.extend(exports,dirtyAdapter);