/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var Err = require('../../../errors');


/**
 * Policies hook
 * @param  {SailsApp} sails
 */
module.exports = function(sails) {

  /**
   * Expose `policies` hook definition
   */
  var policyHookDef = {

    defaults: {

      // Default policy mappings (allow all)
      policies: { }
    },

    configure: function () {
      this.middleware || (this.middleware = { });
    },

    /**
     * Initialize is fired first thing when the hook is loaded
     *
     * @api public
     */
    initialize: function(cb) {

      // Grab policies config & policy modules and trigger callback
      this.loadMiddleware(function (err) {
        if (err) { return cb(err); }

        sails.log.verbose('Finished loading policy middleware logic.');
        try {
          this.bindPolicies();
        } catch (e) {
          return cb(e);
        }
        return cb();
      }.bind(this));

    },

    /**
     * Wipe everything and (re)load middleware from policies
     * (policies.js config is already loaded at this point)
     *
     * @api private
     */
    loadMiddleware: function(cb) {
      // Load policy modulesfrom disk.
      sails.log.verbose('Loading policy modules from app...');
      sails.modules.loadPolicies(function modulesLoaded (err, modules) {
        if (err) { return cb(err); }

        // Add the loaded policies to our internal dictionary.
        _.extend(this.middleware, modules);

        // If any policies were specified when loading Sails, add those on
        // top of the ones loaded from disk.
        if (sails.config.policies && sails.config.policies.moduleDefinitions) {
          _.extend(this.middleware, sails.config.policies.moduleDefinitions);
        }

        // Validate that all policies are functions.
        try {
          _.each(_.keys(this.middleware), function(policyName) {
            // If we find a bad'n, bail out.
            if (!_.isFunction(sails.hooks.policies.middleware[policyName])) {
              throw new Error('Failed loading invalid policy `' + policyName + '` (expected a function, but got a `' + typeof(sails.hooks.policies.middleware[policyName]) + '`' );
            }
          });
        } catch (e) {
          return cb(e);
        }

        // Set the _middlewareType property on each policy.
        _.each(this.middleware, function(policyFn, policyName) {
          policyFn._middlewareType = 'POLICY: '+policyName;
        });

        return cb();
      }.bind(this));
    },

    /**
     * Curry the policy chains into the appropriate controller functions
     *
     * @api private
     */
    bindPolicies: function() {

      // Build / normalize policy config
      this.mapping = this.buildPolicyMap();

      // Register action middleware for each item in the map
      _.each(this.mapping, function(policies, targets) {
        sails.registerActionMiddleware(policies, targets);
      });

      // Emit event to let other hooks know we're ready to go
      sails.log.verbose('Policy-controller bindings complete!');
      sails.emit('hook:policies:bound');
    },


    /**
     * Build normalized, hook-internal representation of policy mapping
     * by performing a non-destructive parse of `sails.config.policies`
     *
     * @returns {Object} mapping
     * @api private
     */
    buildPolicyMap: function () {

      // Sort the policy keys alphabetically, ensuring that more restrictive
      // keys (e.g. user/foo) come after less restrictive (e.g. user/*).
      // Ignore `moduleDefinitions` since it is a special key used to allow
      // programmatic setting of policy functions.
      var actionsToProtect = _.without(_.keys(sails.config.policies), 'moduleDefinitions').sort();

      // Declare a "never allow" function to use when a policy of `false` is encountered.
      var neverAllow = function neverAllow (req, res, next) {
        res.forbidden();
      };
      neverAllow._middlewareType = 'POLICY: neverAllow';

      // Loop through the keys and create the map.
      var mapping = _.reduce(actionsToProtect, function (memo, target, index) {

        // Make sure policies are contained in an array.
        if (!_.isArray(sails.config.policies[target])) {
          throw new Error('Invalid policy setting for `' + target + '`: policies must be specified as an array!');
        }

        // Get the policies the user wants to add to this set of actions.
        // Note the use of _.compact to transform [undefined] into [].
        var policies = _.compact(_.map(sails.config.policies[target], function(policy) {
          // If the policy is `true`, make sure it's the only one for this target.
          if (policy === true) {
            if (sails.config.policies[target].length > 1) {
              throw new Error('Invalid policy setting for `' + target + '`: if `true` is specified, it must be the only policy in the array.');
            }
            // Map `false` to  the "never allow" policy.
            return undefined;
          }
          // If the policy is `false`, make sure it's the only one for this target.
          if (policy === false) {
            if (sails.config.policies[target].length > 1) {
              throw new Error('Invalid policy setting for `' + target + '`: if `false` is specified, it must be the only policy in the array.');
            }
            // Map `false` to  the "never allow" policy.
            return neverAllow;
          }
          // If the policy is a string, make sure it corresponds to one of the policies we loaded.
          if (_.isString(policy)) {
            if (!sails.hooks.policies.middleware[policy.toLowerCase()]) {
              throw new Error('Invalid policy setting for `' + target + '`: `' + policy + '` does not correspond to any of the loaded policies.');
            }
            return sails.hooks.policies.middleware[policy.toLowerCase()];
          }
          // If the policy is a function, return it.
          if (!_.isFunction(policy)) {
            policy._middlewareType = 'POLICY: ' + (policy.name || 'anonymous');
            return policy;
          }
          // Otherwise just bail.
          throw new Error('Invalid policy setting for `' + target + '`: a policy must be a string, a function or `false`.');

        }));

        // Start an array of targets that this set of policies will be applied to or ignored for.
        var allowDenyList = [target];

        // If this target is a wildcard, then any other target that matches it will
        // override it.  We may change this behavior / make it optional in the future,
        // but for now policies are NOT cumulative.
        if (target.slice(-2) === '/*') {
          // Get a version of the target without the /*
          var nakedTarget = target.slice(0,-2);
          // Get a version of the target without the .
          var slashTarget = target.slice(0,-1);
          // If we already bound a policy to the naked target, then flag that the
          // current policy should _not_ be applied to it.
          if (memo[nakedTarget]) {
            allowDenyList.push('!' + nakedTarget);
          }
          // Now run through the rest of the targets in the list, and if any of them
          // start with the "slashTarget", make sure this policy does _not_ apply to them.
          // So if our target is `user/foo/*`, and we see `user/foo/bar` in the list,
          // we will add that to the blacklist for this policy.
          for (var i = index + 1; i < actionsToProtect.length; i++) {
            var nextTarget = actionsToProtect[i];
            if (nextTarget.indexOf(slashTarget) === 0) {
              allowDenyList.push('!' + nextTarget);
            }
            // As soon as we find a non-matching target, we're done (because they're
            // arranged in alphabetical order).
            else {
              break;
            }
          }
        }

        // Transform the allow/deny list into a comma-delimited string that can be
        // understood by `registerActionMiddleware`.
        memo[allowDenyList.join(',')] = policies;

        return memo;

      }, {});

      return mapping;
    },

    /**
     * Bind a route directly to a policy
     */
    bindDirectlyToRoute: function (event) {
      // Only pay attention to delegated route events
      // if `policy` is declared in event.target
      if ( !event.target || !event.target.policy ) {
        return;
      }

      var fn;

      if (_.isFunction(event.target.policy)) {
        fn = event.target.policy;
      } else {
        var policyId = event.target.policy.toLowerCase();

        // Policy doesn't exist
        if (!this.middleware[policyId] ) {
          return Err.fatal.__UnknownPolicy__ (policyId, referencedIn, sails.config.paths.policies);
        }

        // Bind policy function to route
        fn = this.middleware[policyId];
      }

      sails.router.bind(event.path, fn, event.verb, _.merge(event.options, event.target));
    }

  };

  /**
   * Bind routes for manually-mapped policies from `config/routes.js`
   */
  sails.on('route:typeUnknown', function (ev) {
    policyHookDef.bindDirectlyToRoute(ev);
  });

  return policyHookDef;
};


