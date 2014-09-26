/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../actionUtil');

/**
 * Create Record
 *
 * post /:modelIdentity
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified criteria.  If an id was specified, just the instance with
 * that unique id will be returned.
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 * @param {*} * - other params will be used as `values` in the create
 */
module.exports = function createRecord( req, res ) {

  var Model = actionUtil.parseModel( req );
  var data = actionUtil.parseValues( req, Model );

  /* if ( req.user && req.user.id ) {
    sails.log.debug( 'Injecting req.user into blueprint create -> data.' );
    data.user = req.user.id;
  } else {
    // exception for creating new users, otherwise any creative act needs a logged in user
    if ( Model.identity !== 'user' ) return res.forbidden( "Create blueprint needs an authenticated user!" );
  } */

  // Create new instance of model using data from params
  Model.create( data ).exec( function created( err, newInstance ) {

    // Differentiate between waterline-originated validation errors
    // and serious underlying issues. Respond with badRequest if a
    // validation error is encountered, w/ validation info.
    if ( err ) return res.negotiate( err );

    // If we have the pubsub hook, use the model class's publish method
    // to notify all subscribers about the created item
    if ( req._sails.hooks.pubsub ) {
      if ( req.isSocket ) {
        Model.subscribe( req, newInstance );
        Model.introduce( newInstance );
      }
      Model.publishCreate( newInstance, !req.options.mirror && req );
    }

    // Do a final query to populate the associations of the record.
    var Q = Model.findOne( newInstance[ Model.primaryKey ] );
    Q = actionUtil.populateEach( Q, req );
    Q.exec( function foundAgain( err, populatedRecord ) {
      if ( err ) return res.serverError( err );
      if ( !populatedRecord ) return res.serverError( 'Could not find record after updating!' );

      // Send JSONP-friendly response if it's supported
      // (HTTP 201: Created)
      res.status( 201 );
      res.ok( actionUtil.emberizeJSON( Model, populatedRecord, req.options.associations, false ) );

    } );
  } );
};
