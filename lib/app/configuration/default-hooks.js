/**
 * Default hooks
 *
 * (order still matters for now for some of these-
 *  but mostly not, due to ouruse of events...
 *  ...but for a few core hooks, e.g. `moduleloader`,
 *  it still does.)
 */

module.exports = {
  'moduleloader': true,//<< TODO: absorb into core (i.e. federate its methods out to the places where they are used and remove support for `sails.modules`)
  'logger': true,//<< TODO: absorb into core (i.e. like what we did w/ the controllers hook -- can live in `lib/app/private/log-ship.js`, and the rest can be inlined)
  'request': true,
  'orm': 'sails-hook-orm',
  'views': true,
  'blueprints': true,
  'responses': true,
  'helpers': 'sails-hook-helpers',//<< TODO: pull this into a built-in core hook in `lib/hooks/helpers` -- then replace README in sails-hook-helpers repo with link and short explanation, and publish major version of sails-hook-helpers on NPM
  'sockets': 'sails-hook-sockets',
  'pubsub': true,//<< TODO: **merge into sails-hook-sockets -- i.e. if orm hook available, then sails-hook-sockets decorates models with RPS methods**
  'policies': true,
  'services': true,
  'security': true,
  'i18n': true,
  'userconfig': true,//<< TODO: absorb into core (i.e. like what we did w/ the controllers hook -- can live in `lib/app/configuration`)
  'session': true,
  'grunt': 'sails-hook-grunt',
  'http': true,
  'userhooks': true//<< TODO: absorb into core (i.e. like what we did w/ the controllers hook -- its logic can live in `lib/app/private`, and be driven by `lib/hooks/index.js`)
};
