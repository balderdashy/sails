/**
 * mock-res
 * v0.3.0
 *
 * https://www.npmjs.com/package/mock-res
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 diachedelic
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable */
module.exports = MockServerResponse;

var Transform = require('stream').Transform,
  util = require('util'),
  STATUS_CODES = require('http').STATUS_CODES;

function MockServerResponse(finish) {
  Transform.call(this);

  this.statusCode = 200;
  this.statusMessage = STATUS_CODES[this.statusCode];

  this._header = this._headers = {};
  if (typeof finish === 'function')
    this.on('finish', finish);
}

util.inherits(MockServerResponse, Transform);

MockServerResponse.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};

MockServerResponse.prototype.setHeader = function(name, value) {
  this._headers[name.toLowerCase()] = value;
};

MockServerResponse.prototype.getHeader = function(name) {
  return this._headers[name.toLowerCase()];
};

MockServerResponse.prototype.removeHeader = function(name) {
  delete this._headers[name.toLowerCase()];
};

MockServerResponse.prototype.writeHead = function(statusCode, reason, headers) {
  if (arguments.length == 2 && typeof arguments[1] !== 'string') {
    headers = reason;
    reason = undefined;
  }
  this.statusCode = statusCode;
  this.statusMessage = reason || STATUS_CODES[statusCode] || 'unknown';
  if (headers) {
    for (var name in headers) {
      this.setHeader(name, headers[name]);
    }
  }
};

MockServerResponse.prototype._getString = function() {
  return Buffer.concat(this._readableState.buffer).toString();
};

MockServerResponse.prototype._getJSON = function() {
  return JSON.parse(this._getString());
};

/* Not implemented:
MockServerResponse.prototype.writeContinue()
MockServerResponse.prototype.setTimeout(msecs, callback)
MockServerResponse.prototype.headersSent
MockServerResponse.prototype.sendDate
MockServerResponse.prototype.addTrailers(headers)
*/

/* eslint-enable */
