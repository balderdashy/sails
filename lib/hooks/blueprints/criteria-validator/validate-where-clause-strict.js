/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var isEqFilter = require('./private/is-eq-filter');


// A prefix string to use at the beginning of error messages
// relating to this `where` clause being unparseable.
var E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX =
'Could not parse the provided `where` clause.  Refer to the Sails documentation '+
'for up-to-date info on supported query language syntax:\n'+
'(http://sailsjs.com/documentation/concepts/models-and-orm/query-language)\n'+
'Details: ';


// Predicate modifiers
var PREDICATE_OPERATORS = [
  'or',
  'and'
];

// "Not in" operators
// (these overlap with sub-attr modifiers-- see below)
var NIN_OPERATORS = [
  '!', 'not'
];


// Sub-attribute modifiers
var SUB_ATTR_MODIFIERS = [
  '<', 'lessThan',
  '<=', 'lessThanOrEqual',
  '>', 'greaterThan',
  '>=', 'greaterThanOrEqual',

  '!', 'not', // << these overlap with `not in` operators

  // The following sub-attribute modifiers also have another,
  // more narrow classification: string search modifiers.
  'like',
  'contains',
  'startsWith',
  'endsWith'
];

// String search modifiers
// (these overlap with sub-attr modifiers-- see above)
var STRING_SEARCH_MODIFIERS = [
  'like',
  'contains',
  'startsWith',
  'endsWith'
];


/**
 * validateWhereClauseStrict()
 *
 * Check the `WHERE` clause for obviously unsupported usage.
 *
 * This does not do any schema-aware validation-- its job is merely
 * to check for structural issues, and to provide a better experience
 * when integrating from userland code.
 *
 * @param  {Dictionary} where
 *         A hypothetically well-formed `where` clause from
 *         a Waterline criteria.
 *
 * @throws {Error} If WHERE clause cannot be parsed.
 *         @property {String} `code: 'E_WHERE_CLAUSE_UNPARSEABLE'`
 */
module.exports = function validateWhereClauseStrict(where) {

  if (!_.isObject(where) || _.isArray(where) || _.isFunction(where)) {
    throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Expected `where` to be a dictionary, but got: `'+util.inspect(where,{depth: null})+'`'));
  }

  // Recursively iterate through the provided `where` clause, starting with each top-level key.
  (function _recursiveStep(clause){

    _.each(clause, function (rhs, key){

      //  ╔═╗╦═╗╔═╗╔╦╗╦╔═╗╔═╗╔╦╗╔═╗
      //  ╠═╝╠╦╝║╣  ║║║║  ╠═╣ ║ ║╣
      //  ╩  ╩╚═╚═╝═╩╝╩╚═╝╩ ╩ ╩ ╚═╝
      //  ┌─    ┌─┐┬─┐     ┌─┐┌┐┌┌┬┐    ─┐
      //  │───  │ │├┬┘     ├─┤│││ ││  ───│
      //  └─    └─┘┴└─  ┘  ┴ ┴┘└┘─┴┘    ─┘
      // If this is an OR or AND predicate...
      if (_.contains(PREDICATE_OPERATORS, key)) {

        // RHS of a predicate must always be an array.
        if (!_.isArray(rhs)) {
          throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Expected an array at `'+key+'`, but instead got:'+util.inspect(rhs,{depth: null})+'\n(`'+key+'` should always be provided with an array on the right-hand side.)'));
        }//-•

        // If the array is empty, then this is puzzling.
        // e.g. `{ or: [] }`
        if (_.keys(rhs).length === 0) {
          // But we will tolerate it for now for compatibility.
          // (it's not _exactly_ invalid, per se.)
        }

        // >-
        // Loop over each sub-clause within this OR/AND predicate.
        _.each(rhs, function (subClause){

          // Check that each sub-clause is a plain dictionary, no funny business.
          if (!_.isObject(subClause) || _.isArray(subClause) || _.isFunction(subClause)) {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Expected each item within a `'+key+'` predicate\'s array to be a dictionary, but got: `'+util.inspect(subClause,{depth: null})+'`'));
          }

          // Recursive call
          _recursiveStep(subClause);

        });//</each sub-clause inside of predicate>

      }
      //  ╦╔╗╔  ┌─┐┬┬ ┌┬┐┌─┐┬─┐
      //  ║║║║  ├┤ ││  │ ├┤ ├┬┘
      //  ╩╝╚╝  └  ┴┴─┘┴ └─┘┴└─
      // Else if this is an IN (equal to any) filter...
      else if (_.isArray(rhs)) {

        // If the array is empty, then this is puzzling.
        // e.g. `{ fullName: [] }`
        if (_.keys(rhs).length === 0) {
          // But we will tolerate it for now for compatibility.
          // (it's not _exactly_ invalid, per se.)
        }

        // Validate each item in the `in` array as an equivalency filter.
        _.each(rhs, function (subFilter){

          if (!isEqFilter(subFilter)) {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(Sub-filters within an `in` must be provided as primitive values like strings, numbers, booleans, and null.)'));
          }

        });

      }
      //  ╔╦╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗╦═╗╦ ╦  ╔═╗╔═╗  ╔═╗╦ ╦╔╗    ╔═╗╔╦╗╔╦╗╦═╗  ┌┬┐┌─┐┌┬┐┬┌─┐┬┌─┐┬─┐┌─┐
      //   ║║║║   ║ ║║ ║║║║╠═╣╠╦╝╚╦╝  ║ ║╠╣   ╚═╗║ ║╠╩╗───╠═╣ ║  ║ ╠╦╝  ││││ │ │││├┤ │├┤ ├┬┘└─┐
      //  ═╩╝╩╚═╝ ╩ ╩╚═╝╝╚╝╩ ╩╩╚═ ╩   ╚═╝╚    ╚═╝╚═╝╚═╝   ╩ ╩ ╩  ╩ ╩╚═  ┴ ┴└─┘─┴┘┴└  ┴└─┘┴└─└─┘
      //  ┌─    ┌─┐┌─┐┌┐┌┌┬┐┌─┐┬┌┐┌┌─┐   ┬   ┬  ┌─┐┌─┐┌─┐  ┌┬┐┬ ┬┌─┐┌┐┌   ┌─┐┌┬┐┌─┐    ─┐
      //  │───  │  │ ││││ │ ├─┤││││└─┐   │   │  ├┤ └─┐└─┐   │ ├─┤├─┤│││   ├┤  │ │    ───│
      //  └─    └─┘└─┘┘└┘ ┴ ┴ ┴┴┘└┘└─┘┘  o┘  ┴─┘└─┘└─┘└─┘   ┴ ┴ ┴┴ ┴┘└┘┘  └─┘ ┴ └─┘    ─┘
      // Else if the right-hand side is a dictionary...
      else if (_.isObject(rhs) && !_.isArray(rhs) && !_.isFunction(rhs)) {

        // If the dictionary is empty, then this is puzzling.
        // e.g. { fullName: {} }
        if (_.keys(rhs).length === 0) {
          throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(rhs,{depth: null})+'\n(If a dictionary is provided, it is expected to consist of sub-attribute modifiers like `contains`, etc.  But this dictionary is empty!)'));
        }

        // Check to verify that it is a valid dictionary with a sub-attribute modifier.
        _.each(rhs, function (subFilter, subAttrModifierKey) {

          // If this is a documented sub-attribute modifier, then validate it as such.
          if (_.contains(SUB_ATTR_MODIFIERS, subAttrModifierKey)) {

            // If the sub-filter is an array...
            //
            // > The RHS value for sub-attr modifier is only allowed to be an array for
            // > the `not` modifier. (This is to allow for use as a "NOT IN" filter.)
            // > Otherwise, arrays are prohibited.
            if (_.isArray(subFilter)) {

              // If this is _actually_ a `not in` filter (e.g. a "!" with an array on the RHS)...
              // e.g.
              // ```
              // fullName: {
              //   '!': ['murphy brown', 'kermit']
              // }
              // ```
              if (_.contains(NIN_OPERATORS, subAttrModifierKey)) {

                // If the array is empty, then this is puzzling.
                // e.g. `{ fullName: { '!': [] } }`
                if (_.keys(subFilter).length === 0) {
                  // But we will tolerate it for now for compatibility.
                  // (it's not _exactly_ invalid, per se.)
                }

                // Loop over the "not in" values in the array
                _.each(subFilter, function (blacklistItem){

                  // We handle this here as a special case.
                  if (!isEqFilter(blacklistItem)) {
                    throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value within the blacklist array provided at sub-attribute modifier (`'+subAttrModifierKey+'`) for `'+key+'`:'+util.inspect(blacklistItem,{depth: null})+'\n(Blacklist items within a `not in` array must be provided as primitive values like strings, numbers, booleans, and null.)'));
                  }

                });//</_.each() :: item in the "NOT IN" blacklist array>
              }
              // Otherwise, this is some other attr modifier...which means this is invalid,
              // since arrays are prohibited.
              else {
                throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected array at sub-attribute modifier (`'+subAttrModifierKey+'`) for `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(An array cannot be used as the right-hand side of a `'+subAttrModifierKey+'` sub-attribute modifier.  Instead, try using `or` at the top level.  Refer to the Sails docs for details.)'));
              }

            }
            // Otherwise the sub-filter for this sub-attr modifier should
            // be validated according to its modifer.
            else {

              // If this sub-attribute modifier is specific to strings
              // (e.g. "contains") then only allow strings, numbers, and booleans.  (Dates and null should not be used.)
              if (_.contains(STRING_SEARCH_MODIFIERS, subAttrModifierKey)) {
                if (!_.isString(subFilter) && !_.isNumber(subFilter) && !_.isBoolean(subFilter)){
                  throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at sub-attribute modifier (`'+subAttrModifierKey+'`) for `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(The right-hand side of a string search modifier like `'+subAttrModifierKey+'` must always be a string, number, or boolean.)'));
                }
              }
              // Otherwise this is a miscellaneous sub-attr modifier,
              // so validate it as an eq filter.
              else {
                if (!isEqFilter(subFilter)) {
                  throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at sub-attribute modifier (`'+subAttrModifierKey+'`) for `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(The right-hand side of a `'+subAttrModifierKey+'` must be a primitive value, like a string, number, boolean, or null.)'));
                }
              }//</else (validate this sub-attr modifier's RHS as an eq filter)>

            }//</else (validation rule depends on what modifier this is)>

          }//</if this is a recognized sub-attr modifier>
          //
          // Otherwise, this is NOT a recognized sub-attribute modifier and it makes us uncomfortable.
          else {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unrecognized sub-attribute modifier (`'+subAttrModifierKey+'`) for `'+key+'`.  Make sure to use a recognized sub-attribute modifier such as `startsWith`, `<=`, `!`, etc. )'));
          }

        });//</each sub-attr modifier>

      }//</RHS is a dictionary>
      //
      //  ╔═╗╔═╗ ╦ ╦╦╦  ╦╔═╗╦  ╔═╗╔╗╔╔═╗╦ ╦  ┌─┐┬┬ ┌┬┐┌─┐┬─┐
      //  ║╣ ║═╬╗║ ║║╚╗╔╝╠═╣║  ║╣ ║║║║  ╚╦╝  ├┤ ││  │ ├┤ ├┬┘
      //  ╚═╝╚═╝╚╚═╝╩ ╚╝ ╩ ╩╩═╝╚═╝╝╚╝╚═╝ ╩   └  ┴┴─┘┴ └─┘┴└─
      // Last but not least, when nothing else matches...
      else {

        // Check the right-hand side as a normal equivalency filter.
        if (!isEqFilter(rhs)) {
          throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(rhs,{depth: null})+'\n(When filtering by exact match, use a primitive value: a string, number, boolean, or null.)'));
        }

      }//</else:: is normal equivalency filter>

    });//</_.each() : check each top-level key>

  })//</self-invoking recursive function (def)>
  //
  // Kick off our recursion with the `where` clause:
  (where);


};


