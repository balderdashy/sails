/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var async = require('async');


//
// TODO
// Pull this into a separate module, since it's not specific to Sails.
//


/**
 * Mix-in an `after` function to an EventEmitter.
 *
 * If `events` have already fired, trigger fn immediately (with no args)
 * Otherwise bind a normal one-time event using `EventEmitter.prototype.once()`.
 * Useful for checking whether or not something has finished loading, etc.
 *
 * This is a lot like jQuery's `$(document).ready()`.
 *
 * @param  {EventEmitter} emitter
 */

module.exports = function mixinAfter(emitter) {


  /**
   * { emitter.warmEvents }
   *
   * Events which have occurred at least once
   * (Required to support `emitter.after()`)
   */
  emitter.warmEvents = {};


  /**
   * emitter.emit()
   *
   * Override `EventEmitter.prototype.emit`.
   * (Required to support `emitter.after()`)
   */

  var _emit = emitter.emit;
  emitter.emit = function(evName) {
    var args = Array.prototype.slice.call(arguments, 0);
    emitter.warmEvents[evName] = true;
    _emit.apply(emitter, args);
  };


  /**
   * `emitter.after()`
   *
   * Fires your handler **IF THE SPECIFIED EVENT HAS ALREADY BEEN TRIGGERED** or **WHEN IT IS TRIGGERED**.
   *
   * @param  {String|Array} events   [name of the event(s)]
   * @param  {Function}     fn       [event handler function]
   * @context {Sails}
   */

  emitter.after = function(events, fn) {

    // Support a single event or an array of events
    if (!_.isArray(events)) {
      events = [events];
    }

    // Convert named event dependencies into an array
    // of async-compatible functions.
    var dependencies = _.reduce(events,
      function(dependencies, event) {

        var handlerFn = function(cb) {
          if (emitter.warmEvents[event]) {
            cb();
          } else {
            emitter.once(event, cb);
          }
        };
        dependencies.push(handlerFn);
        return dependencies;
      }, []);

    // When all events have fired, call `fn`
    // (all arguments passed to `emit()` calls are discarded)
    async.parallel(dependencies, function(err) {
      if (err) sails.log.error(err);
      return fn();
    });

  };

};
