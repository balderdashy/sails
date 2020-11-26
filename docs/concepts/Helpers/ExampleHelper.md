# An example helper

A common use of helpers is to encapsulate some repeated database queries.  For example, suppose our app had a `User` model which included a field `lastActiveAt` which tracked the time of their last login.  A common task in such an app might be to retrieve the list of users most recently online.  Rather than hard-coding this query into multiple locations, we could write a helper instead:

```javascript
// api/helpers/get-recent-users.js
module.exports = {


  friendlyName: 'Get recent users',


  description: 'Retrieve a list of users who were online most recently.',


  extendedDescription: 'Use `activeSince` to only retrieve users who logged in since a certain date/time.',


  inputs: {

    numUsers: {
      friendlyName: 'Number of users',
      description: 'The maximum number of users to retrieve.',
      type: 'number',
      defaultsTo: 5
    },

    activeSince: {
      description: 'Cut-off time to look for logins after, expressed as a JS timestamp.',
      extendedDescription: 'Remember: A _JS timestamp_ is the number of **milliseconds** since [that fateful night in 1970](https://en.wikipedia.org/wiki/Unix_time).',
      type: 'number',
      defaultsTo: 0
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Recent users',
      outputDescription: 'An array of users who recently logged in.',
    },

    noUsersFound: {
      description: 'Could not find any users who logged in during the specified time frame.'
    }

  },


  fn: async function (inputs, exits) {

    // Run the query
    var users = await User.find({
      active: true,
      lastLogin: { '>': inputs.activeSince }
    })
    .sort('lastLogin DESC')
    .limit(inputs.numUsers);

    // If no users were found, trigger the `noUsersFound` exit.
    if (users.length === 0) {
      throw 'noUsersFound';
    }

    // Otherwise return the records through the `success` exit.
    return exits.success(users);

  }

};
```

### Usage

To call this helper from app code using the default options (in an action, for example), we would use:

```javascript
var users = await sails.helpers.getRecentUsers();
```

To alter the criteria for the returned users, we could pass in some values:

```javascript
var users = await sails.helpers.getRecentUsers(50);
```

Or, to get the 10 most recent users who have logged in since St. Patrick's Day, 2017:

```javascript
await sails.helpers.getRecentUsers(10, (new Date('2017-03-17')).getTime());
```

> Note: These values passed into a helper at runtime are sometimes called **argins**, or options, and they correspond with the key order of the helper's declared input definitions (e.g. `numUsers` and `activeSince`).

Again, chaining `.with()` in order to use named parameters:

```javascript
await sails.helpers.getRecentUsers.with({
  numUsers: 10,
  activeSince: (new Date('2017-03-17')).getTime()
});
```


##### Exceptions

Finally, to handle the `noUsersFound` exit explicitly rather than simply treating it like any other error, we can use [`.intercept()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/intercept) or [`.tolerate()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/tolerate):

```javascript
var users = await sails.helpers.getRecentUsers(10)
.tolerate('noUsersFound', ()=>{
  // ... handle the case where no users were found. For example:
  sails.log.verbose(
    'Worth noting: Just handled a request for active users during a time frame '+
    'where no users were found.  Anyway, I didn\'t think this was possible, because '+
    'our app is so cool and popular.  But there you have it.'
  );
});
```

```javascript
var users = await sails.helpers.getRecentUsers(10)
.intercept('noUsersFound', ()=>{
  return new Error('Inconceivably, no active users were found for that timeframe.');
});
```

The main advantage of using helpers is the ability to update functionality in many parts of an app by changing code in a single place.  For example, by changing the default value of `numUsers` from `5` to `15`, we update the size of the default list returned in _any_ place that uses the helper.  Also, by using well-defined inputs like `numUsers` and `activeSince`, we guarantee we&rsquo;ll get helpful errors if we accidentally use an invalid (i.e. non-numeric) value.


### Notes

A few more notes about the example `getRecentUsers()` helper above:

> * Many of the fields such as `description` and `friendlyName` are not strictly required but are immensely helpful in keeping the code maintainable, especially when sharing the helper across multiple apps.
> * The `noUsersFound` exit may or may not be helpful, depending on your app.  If you always want to perform a specific action when no users are returned (for example, redirecting to a different page), this exit would be a good idea.  On the other hand, if you simply want to tweak some text in a view based on whether or not users were returned, it might be better to just have the `success` exit and check the `length` of the returned array in your action or view code.

<docmeta name="displayName" value="Example helper">
