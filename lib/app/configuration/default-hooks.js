/**
 * Default hooks
 * (order matters)
 * TODO: make order _not_ matter (it pretty much doesn't already b/c events- but for a few core hooks it still does)
 */

module.exports = {
  'moduleloader': true,
  'logger': true,
  'request': true,
  'orm': true,
  'views': true,
  'blueprints': true,
  'responses': true,
  'controllers': true,
  'sockets': require('sails-hook-sockets'),
  'pubsub': true,
  'policies': true,
  'services': true,
  'csrf': true,
  'cors': true,
  'i18n': true,
  'userconfig': true,
  'session': true,
  'grunt': true,
  'http': true,
  'userhooks': true
};
