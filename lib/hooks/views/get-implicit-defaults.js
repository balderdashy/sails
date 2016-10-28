/**
 * getImplicitDefaults()
 *
 * Get a dictionary of implicit defaults this hook would like to merge
 * into `sails.config` when Sails is loaded.
 *
 * @param  {Dictionary} existingConfig
 *         Existing configuration which has already been loaded
 *         e.g. the Sails app path, and any config overrides (programmtic, from .sailsrc, etc)
 *
 * @returns {Dictionary}
 */

module.exports = function getImplicitDefaults (existingConfig) {
  return {
    views: {

      // Extension for view files
      extension: 'ejs',

      // Layout is on by default, in the top level of the view directory
      // true === use default
      // false === don't use a layout
      // string === path to layout
      layout: true
    },

    paths: {
      views: existingConfig.appPath + '/views',
      layout: existingConfig.appPath + '/views/layout.ejs'
    }
  };
};
