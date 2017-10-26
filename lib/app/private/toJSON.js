/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * SailsApp.prototype.toJSON()
 *
 * Get a JSON-serializable representation of the current Sails app.
 *
 * @this {SailsApp}
 * @returns {JSON} [a JSON-compatible summary of this Sails app]
 */

module.exports = function toJSON() {

  // `this` refers to our Sails app instance.
  //
  // > Here we set up a local variable, `sails`.  This is for familiarity,
  // > so that we don't accidentally write code in this file that relies on
  // > access to the Sails global.
  var sails = this;


  // Build JSON serializable dictionary that summarizes the Sails app instance.
  var sailsAppSummary;
  try {

    sailsAppSummary = _.reduce(sails, function (_jsonSerializable, val, key) {

      // Allow `config` to go straight through as-is.
      // > (non JSON-serializable things will have to be handled later --
      // > we don't want to introduce the slowness of an rttc.dehydrate() here)
      if (key === 'config') {
        _jsonSerializable[key] = val;
      }
      //‡
      // Turn `hooks` into an array of hook identities.
      else if (key === 'hooks') {
        _jsonSerializable.hooks = _.reduce(val, function (memo, hook, hookName) {
          memo.push(hookName);
          return memo;
        }, []);
      }
      //‡
      // Turn `models` into an array of "model summary" dictionaries.
      else if (key === 'models') {
        _jsonSerializable[key] = _.reduce(val, function (memo, Model) {

          // Skip virtual models (i.e. junctions)
          if (Model.junctionTable) { return memo; }

          // But otherwise, push on a stripped down version of the model.
          // > (again, any nested, non-JSON-serializable things will have to be handled
          // > later -- we don't want to introduce the slowness of an rttc.dehydrate() here)
          memo.push({
            identity: Model.identity,
            globalId: Model.globalId,
            datastore: Model.datastore,
            tableName: Model.tableName,
            hasSchema: Model.hasSchema,
            primaryKey: Model.primaryKey,
            attributes: Model.attributes,
          });

          return memo;

        }, []);
      }
      //‡
      // Otherwise, this is some other key on the Sails app instance.
      else {
        // (So, we'll just ignore it, omitting it from this JSON-serializable value we're building.)
      }//>-

      return _jsonSerializable;

    }, {});//</_.reduce :: sailsAppSummary>


  } catch (e) {
    throw new Error('Consistency violation: Unexpected error when attempting to build a JSON-serializable version of the Sails app instance.  Details: '+e.stack);
  }

  // Return our JSON serializable summary of this Sails app instance.
  return sailsAppSummary;

};
