/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var flaverr = require('flaverr');
var isEqFilter = require('./is-eq-filter');


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

  if (!_.isObject(where)) {
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
      //  ╔═╗╦ ╦╔╗    ╔═╗╔╦╗╔╦╗╦═╗  ┌┬┐┌─┐┌┬┐┬┌─┐┬┌─┐┬─┐
      //  ╚═╗║ ║╠╩╗───╠═╣ ║  ║ ╠╦╝  ││││ │ │││├┤ │├┤ ├┬┘
      //  ╚═╝╚═╝╚═╝   ╩ ╩ ╩  ╩ ╩╚═  ┴ ┴└─┘─┴┘┴└  ┴└─┘┴└─
      //  ┌─    ┌─┐┌─┐┌┐┌┌┬┐┌─┐┬┌┐┌┌─┐   ┌─┐┬─┐┌─┐┌─┐┌┬┐┌─┐┬─┐  ┌┬┐┬ ┬┌─┐┌┐┌   ┌─┐┌┬┐┌─┐    ─┐
      //  │───  │  │ ││││ │ ├─┤││││└─┐   │ ┬├┬┘├┤ ├─┤ │ ├┤ ├┬┘   │ ├─┤├─┤│││   ├┤  │ │    ───│
      //  └─    └─┘└─┘┘└┘ ┴ ┴ ┴┴┘└┘└─┘┘  └─┘┴└─└─┘┴ ┴ ┴ └─┘┴└─   ┴ ┴ ┴┴ ┴┘└┘┘  └─┘ ┴ └─┘    ─┘
      // Else if this is a sub-attribute modifier...
      else if (_.contains(SUB_ATTR_MODIFIERS, key)) {

        // If the RHS is an array...
        // > RHS is only allowed to be an array for the `not` modifier.
        // > (This is to allow for use as a "NOT IN" filter.)
        // > Otherwise, arrays are prohibited.
        if (_.isArray(rhs)) {

          // If this is _actually_ a `not in` filter (e.g. a "!" with an array on the RHS)...
          if (_.contains(NIN_OPERATORS, key)) {
            _.each(rhs, function (subFilter){

              // We handle this here as a special case.
              if (!isEqFilter(subFilter)) {
                throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(Sub-filters within a `not in` must be provided as primitive values like strings, numbers, booleans, and null.)'));
              }

            });//</_.each() :: sub-filter in the "NOT IN" array>
          }
          // Otherwise, this is some other attr modifier.. which means this is invalid,
          // since arrays are prohibited.
          else {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected array at `'+key+'`:'+util.inspect(rhs,{depth: null})+'\n(An array cannot be used as the right-hand side of a `'+key+'` sub-attribute modifier within a criteria.  Instead, try using `or`.)'));
          }

        }
        // Otherwise the RHS is supposed to be an equivalency filter.
        else {

          if (!isEqFilter(rhs)) {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(rhs,{depth: null})+'\n(The right-hand side of a `'+key+'` must be a primitive value, like a string, number, boolean, or null.)'));
          }

        }

      }
      //  ╦╔╗╔  ┌─┐┬┬ ┌┬┐┌─┐┬─┐
      //  ║║║║  ├┤ ││  │ ├┤ ├┬┘
      //  ╩╝╚╝  └  ┴┴─┘┴ └─┘┴└─
      // Else if this is an IN (equal to any) filter...
      else if (_.isArray(rhs)) {

        // Validate each item in the `in` array as an equivalency filter.
        _.each(rhs, function (subFilter){

          if (!isEqFilter(subFilter)) {
            throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(subFilter,{depth: null})+'\n(Sub-filters within an `in` must be provided as primitive values like strings, numbers, booleans, and null.)'));
          }

        });

      }
      //  ╔═╗╔═╗ ╦ ╦╦╦  ╦╔═╗╦  ╔═╗╔╗╔╔═╗╦ ╦  ┌─┐┬┬ ┌┬┐┌─┐┬─┐
      //  ║╣ ║═╬╗║ ║║╚╗╔╝╠═╣║  ║╣ ║║║║  ╚╦╝  ├┤ ││  │ ├┤ ├┬┘
      //  ╚═╝╚═╝╚╚═╝╩ ╚╝ ╩ ╩╩═╝╚═╝╝╚╝╚═╝ ╩   └  ┴┴─┘┴ └─┘┴└─
      // Last but not least, since nothing else matches, then
      // we know that this is a normal equivalency filter.
      else {

        if (!isEqFilter(eqFilter)) {
          throw flaverr('E_WHERE_CLAUSE_UNPARSEABLE', new Error(E_WHERE_CLAUSE_UNPARSEABLE_MSG_PREFIX + 'Unexpected value at `'+key+'`:'+util.inspect(rhs,{depth: null})+'\n(When filtering by exact match, use a primitive value: a string, number, boolean, or null.)'));
        }

      }

    });//</_.each() : check each top-level key>

  })//</self-invoking recursive function (def)>
  //
  // Kick off our recursion with the `where` clause:
  (where);


};


