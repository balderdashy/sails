/**
 * Module dependencies
 */
var _ = require('lodash');
var anchor = require('anchor');
var util = require('util');


/**
 * Mixes in `req.validate`.
 *
 * @param  {Request} req
 * @return {Request}
 */
module.exports = function (req) {
  req.validate = _validate;
  return req;
};



/**
 * req.validate()
 *
 * @param  {Object} usage
 *         (supports either `{type: {}}` or `{}`)
 *
 * @param  {String} redirectTo
 *         (optional)
 *
 * @throws {Error}
 * @api public
 */

function _validate (usage, redirectTo) {
  usage = usage || {};

  // Normalize `usage` to wrap in an additional `type`
  // key, since req.params.all() always returns an object
  // anyways.
  if (!usage.type) {
    usage = { type: usage };
  }

  var invalidParams = anchor(req.params.all()).to(usage);
  if (invalidParams) {
    if (redirectTo) {
      req.flash('error', invalidParams);
      res.redirect(redirectTo);
    }
    else {
      throw new E_INVALID_PARAMS({
        params: req.params.all(),
        usage: usage,
        redirectTo: redirectTo
      });
    }
  }
}




/**
 * Constructs an E_INVALID_PARAMS error.
 * @constructor
 */
function E_INVALID_PARAMS (opts) {
  opts = opts || {};
  this.invalidParams = opts.invalidParams;

  // Generate stack trace
  var e = new Error();
  this.stack = e.stack;
}
E_INVALID_PARAMS.prototype.code = 'E_INVALID_PARAMS';
E_INVALID_PARAMS.prototype.status = 400;
E_INVALID_PARAMS.prototype.toJSON = function () {
  return _.map(this.invalidParams, function (param) {
    var msg;
    if (param.rule === 'required') {
      msg = util.format('Required.');
    }
    else msg = util.format('Required, and should be a %s.', param.rule);

    return {
      parameter: param.property,
      error: msg
    };
  });
};
