var _ = require('underscore');

var dirtyAdapter = require('waterline-dirty');

dirtyAdapter = _.extend(dirtyAdapter,{
	config: _.extend(dirtyAdapter.config, {
		inMemory: true
	})
});

exports = _.extend(exports,dirtyAdapter);