/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var async = require('async');


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// FUTURE
// Pull _most of this_ into a separate module, since it's not specific
// to Sails, and has come up in a few different places.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * Mix-in an `after` function to an EventEmitter.
 *
 * If `events` have already fired, trigger fn immediately (with no args)
 * Otherwise bind a normal one-time event using `EventEmitter.prototype.once()`.
 * Useful for checking whether or not something has finished loading, etc.
 *
 * This is a lot like jQuery's `$(document).ready()`.
 *
 * @param  {EventEmitter} emitter The Sails application instance
 */

module.exports = function mixinAfter(emitter) {


  /**
   * { emitter.warmEvents }
   *
   * Events which have occurred at least once
   * (Required to support `emitter.after()`)
   */
  emitter.warmEvents = {};


  var _originalEmit = emitter.emit;
  /**
   * emitter.emit()
   *
   * Synchronously calls each of the listeners registered for the event named eventName, in the order they were registered, passing the supplied arguments to each.
   *
   * Override `EventEmitter.prototype.emit` to keep track of all the events that have occurred once.
   * (Required to support `emitter.after()`)
   *
   * @param {String} eventName name of the event
   * @return {boolean} Returns true if the event had listeners, false otherwise.
   * @see https://nodejs.org/api/events.html#events_emitter_emit_eventname_args
   */
  emitter.emit = function(eventName) {
    var args = Array.prototype.slice.call(arguments, 0);
    emitter.warmEvents[eventName] = true;
    return _originalEmit.apply(emitter, args);
  };


  /**
   * `emitter.after()`
   *
   * Fires your handler **IF THE SPECIFIED EVENT HAS ALREADY BEEN TRIGGERED** or **WHEN IT IS TRIGGERED**.
   *
   * @param  {String|Array} events   [name of the event(s)]
   * @param  {Function}     fn       [event handler function]
   */

  emitter.after = function(events, fn) {

    // Support a single event or an array of events
    if (!_.isArray(events)) {
      events = [events];
    }

    // Convert named event dependencies into an array
    // of async-compatible functions.
    var dependencies = _.reduce(events, function (dependencies, event) {

      // Push on the handler function.
      dependencies.push(function handlerFn(cb) {

        // If the event has already fired, then just execute our callback.
        if (emitter.warmEvents[event]) {
          return cb();
        }
        // But otherwise, bind a one-time-use handler that listens for the
        // first time this event is fired, and then executes our callback
        // once it does.
        else {
          emitter.once(event, function (){
            return cb();
          });
        }

      });//</declared and pushed on handler function>

      return dependencies;

    }, []);//</_.reduce() :: iterate over each event in order to build `dependencies` (an array of handler functions)>


    // When all events have fired, call `fn`
    // (all arguments passed to `emit()` calls are discarded)
    async.parallel(dependencies, function(err) {
      if (err) {
        console.error('Consistency violation: Received `err`, but this should be impossible!  Here is the error: '+err.stack);
        console.error('^^^If you are seeing this message, then please report this error at http://sailsjs.com/bugs.  (Continuing anyway...)');
      }//>-

      return fn();
    });

  };

};
