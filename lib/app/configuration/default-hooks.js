/**
 * Default hooks
 *
 * (order still matters for now for some of these-
 *  but mostly not, due to ouruse of events...
 *  ...but for a few core hooks, e.g. `moduleloader`,
 *  it still does.)
 */

module.exports = {
  'moduleloader': true,
  'logger': true,
  'request': true,
  'orm': 'sails-hook-orm',
  'views': true,
  'blueprints': true,
  'responses': true,
  'controllers': true,
  'sockets': 'sails-hook-sockets',
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
