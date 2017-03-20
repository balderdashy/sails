/**
 * Stub middleware/handlers for use in tests.
 *
 * @type {Dictionary}
 */
module.exports = {

  HELLO: function(req, res) {
    return res.send('hello world!');
  },

  GOODBYE: function(req, res) {
    return res.send('goodbye world!');
  },

  HELLO_500: function(req, res) {
    return res.status(500).send('hello world!');
  },

  JSON_HELLO: function(req, res) {
    return res.json({
      hello: 'world'
    });
  },

  SOMETHING_THAT_THROWS: function(req, res) {
    throw 'oops';
  },

};
