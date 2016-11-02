/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var util = require('util');


/**
 * @constructor
 */
function RouteFactory(prefix) {
  this._prefix = prefix;
  this._nextTestRoute = 0;
}
RouteFactory.prototype.next = function() {
  this._nextTestRoute++;
  this.current = util.format('/tests/%s%d', this._prefix ? this._prefix + '/' : '', this._nextTestRoute);
  return this.current;
};


module.exports = function (){
  return new RouteFactory();
};

