/**
 * Stub middleware/handlers for use in tests.
 * 
 * @type {Object}
 */
module.exports = {
	HELLO: function (req, res) { res.send('hello world!'); },
	HELLO_500: function (req, res) { res.send(500, 'hello world!'); },
	JSON_HELLO: function (req, res) { res.json({ hello: 'world' }); },
	SOMETHING_THAT_THROWS: function (req, res) { throw 'oops'; },
};