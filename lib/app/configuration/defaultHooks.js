/**
 * Default hooks
 * (order matters)
 * TODO: make order _not_ matter
 */

module.exports = [
  'moduleloader',
  'logger',
  'request',
  'orm',
  'views',
  'blueprints',
  'responses',
  'controllers',
  'sockets',
  'pubsub',
  'policies',
  'services',
  'csrf',
  'cors',
  'i18n',
  'userconfig',
  'session',
  'grunt',
  'http',
  'userhooks'
];
