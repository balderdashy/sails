/**
 * mock-req
 * v0.2.0
 *
 * https://www.npmjs.com/package/mock-req
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
module.exports = MockIncomingMessage;

var Transform = require('stream').Transform,
  util = require('util');

function MockIncomingMessage(options) {
  var self = this;
  options = options || {};

  Transform.call(this);
  this._writableState.objectMode = true;
  this._readableState.objectMode = false;

  // Copy unreserved options
  var reservedOptions = [
    'method',
    'url',
    'headers',
    'rawHeaders'
  ];

  Object.keys(options).forEach(function(key) {
    if (reservedOptions.indexOf(key) === -1)
      self[key] = options[key];
  });

  this.method = options.method || 'GET';
  this.url = options.url || '';

  // Set header names
  this.headers = {};
  this.rawHeaders = [];
  if (options.headers)
    Object.keys(options.headers).forEach(function(key) {
      var val = options.headers[key];

      if(val !== undefined) {
        if (typeof val !== 'string') {
          val += '';
        }

        self.headers[key.toLowerCase()] = val;
        self.rawHeaders.push(key);
        self.rawHeaders.push(val);
      }
    });

  // Auto-end when no body
  if (this.method === 'GET' || this.method === 'HEAD' || this.method === 'DELETE')
    this.end();
}

util.inherits(MockIncomingMessage, Transform);

MockIncomingMessage.prototype._transform = function(chunk, encoding, next) {
  if (this._failError)
    return this.emit('error', this._failError);

  if (typeof chunk !== 'string' && !Buffer.isBuffer(chunk))
    chunk = JSON.stringify(chunk);

  this.push(chunk);

  next();
};

// Causes the request to emit an error when the body is read.
MockIncomingMessage.prototype._fail = function(error) {
  this._failError = error;
};

/* eslint-enable */
