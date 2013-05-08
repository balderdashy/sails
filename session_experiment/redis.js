// Configure Redis
var RedisStore = require('socket.io/lib/stores/redis'),
	redis = require('socket.io/node_modules/redis'),
	pub = redis.createClient(),
	sub = redis.createClient(),
	client = redis.createClient();


// Configure virgin socket.io server to use redis
module.exports = function (io) {

	io.set('store', new RedisStore({
		redis: redis,
		redisPub: pub,
		redisSub: sub,
		redisClient: client
	}));

	return client;

};