/**
 * Module dependencies
 */
var util = require('util');



/**
 * Default 500 and 404 handler.
 * (defers to res.serverError() and res.notFound() whenever possible)
 *
 * With default hook configuration, these handlers apply to both HTTP
 * and virtual requests
 */
module.exports = function(sails) {


  return {

    /**
     * Default 500 handler.
     * (for errors implicitly thrown in middleware/routes)
     *
     * @param  {*} err
     * @param  {Request} req
     * @param  {Response} res
     */
    500: function(err, req, res) {

      try {
        // Use error handler if it exists
        if (typeof res.negotiate === 'function') {
          return res.negotiate(err);
        }
      } catch (e) {}

      try {

        // Catch-all:
        // Log a message and try to use `res.send` to respond.
        sails.log.error('Server Error:');
        sails.log.error(err);
        if (process.env.NODE_ENV === 'production') return res.send(500);
        return res.send(500, err);
      }

      // Serious error occurred-- unable to send response.
      //
      // TODO:
      // Emit an `abort` message on the request object.  If an attached server is managing this request,
      // it should monitor for `abort` events and manage its private resources (e.g. TCP sockets) accordingly.
      catch (errorSendingResponse) {
        sails.log.error('But no response could be sent because another error occurred:');
        sails.log.error(errorSendingResponse);
      }
    },



    /**
     * Default 404 handler.
     * (for unmatched routes)
     *
     * @param  {Request} req
     * @param  {Response} res
     */
    404: function(req, res) {

      // Use `notFound` handler if it exists
      try {
        if (typeof res.notFound === 'function') {
          return res.notFound();
        }
      } catch (e) {}

      // Catch-all:
      // Log a message and try to use `res.send` to respond.
      try {
        sails.log.verbose('A request did not match any routes, and no `res.notFound` handler is configured.');
        res.send(404);
        return;
      }

      // Serious error occurred-- unable to send response.
      //
      // TODO:
      // Emit an `abort` message on the request object.  If an attached server is managing this request,
      // it should monitor for `abort` events and manage its private resources (e.g. TCP sockets) accordingly.
      catch (e) {
        sails.log.error('An unmatched route was encountered in a request...');
        sails.log.error('But no response could be sent because an error occurred:');
        sails.log.error(e);
        return;
      }
    }
  };

};
