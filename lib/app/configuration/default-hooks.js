/**
 * Default hooks
 *
 * (order still matters for now for some of these-
 *  but mostly not, due to ouruse of events...
 *  ...but for a few core hooks, e.g. `moduleloader`,
 *  it still does.)
 *
 *
 * > FUTURE: make sure order does not matter, then once proven/tested,
 * > document it as such. (This will require adding a test that scrambles
 * > the order of this array then loads Sails over and over.)
 */

module.exports = {
  'moduleloader': true,//<< FUTURE: absorb into core (i.e. federate its methods out to the places where they are used and remove support for `sails.modules`)
  'logger': true,//<< FUTURE: absorb into core (i.e. like what we did w/ the controllers hook -- can live in `lib/app/private/log-ship.js`, and the rest can be inlined)
  'request': true,

  // -•-  For poterity, this is where the `orm` hook was formerly inserted (please don't get rid of this until we're a few patch releases into Sails v1, just so it's easier to reference.)

  'views': true,
  'blueprints': true,//<< FUTURE: pull this out into a standalone hook and have it work like the other core hooks that get installed as peers (unless you do --without=blueprints)
  'responses': true,
  'helpers': true,

  // -•-  For poterity, this is where the `sockets` hook was formerly inserted (please don't get rid of this until we're a few patch releases into Sails v1, just so it's easier to reference.)

  'pubsub': true,//<< FUTURE: **pull the private methods into the blueprints hook, and pull the PUBLIC methods into sails-hook-sockets -- i.e. if orm hook available, then sails-hook-sockets decorates models with RPS methods**
  'policies': true,
  'services': true,
  'security': true,
  'i18n': true,//<< FUTURE: pull this out into a standalone hook and have it work like the other core hooks that get installed as peers (unless you do --without=i18n)
  'userconfig': true,//<< FUTURE: absorb into core (i.e. like what we did w/ the controllers hook -- can live in `lib/app/configuration`)
  'session': true,

  // -•-  For poterity, this is where the `grunt` hook was formerly inserted (please don't get rid of this until we're a few patch releases into Sails v1, just so it's easier to reference.)

  'http': true,
  'userhooks': true//<< FUTURE: absorb into core (i.e. like what we did w/ the controllers hook -- its logic can live in `lib/app/private`, and be driven by `lib/hooks/index.js`)
};
