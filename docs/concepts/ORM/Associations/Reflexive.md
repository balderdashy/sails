# Reflexive associations

### Overview

In most cases, an association will be between attributes of two different models&mdash;for example, a relationship between a `User` model and a `Pet` model.  However, it is also possible to have a relationship between two attributes in the _same_ model.  This is called a _reflexive association_.

Consider the following `User` model:

```javascript
// myApp/api/models/User.js
module.exports = {
  attributes: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },

    // Add a singular reflexive association
    bestFriend: {
      model: 'user',
    },

    // Add one side of a plural reflexive association
    parents: {
      collection: 'user',
      via: 'children'
    },

    // Add the other side of a plural reflexive association
    children: {
      collection: 'user',
      via: 'parents'
    },

    // Add another plural reflexive association, this one via-less
    bookmarkedUsers: {
      collection: 'user'
    }

  }
};
```

The reflexive associations in the example `User` model above operate just like any other associations.  The singular `bestFriend` attribute can be set to the primary key of another user (or for the narcissistic, to the same user!).  The `parents` and `children` attributes can be modified using `.addToCollection()`, `.removeFromCollection()` and `.replaceCollection()`.  Note that as with all plural associations, adding to one side will allow the relationship to be accessed by either side, so running:

```javascript
// Add User #12 as a parent of User #23
await User.addToCollection(23, 'parents', 12);
// Find User #12 and populate its children
var userTwelve = await User.findOne(12).populate('children');
```

would return something like:

```javascript
{
  id: 12,
  firstName: 'John',
  lastName: 'Doe',
  bestFriend: null,
  children: [
    {
      id: 23,
      firstName: 'Jane',
      lastName: 'Doe',
      bestFriend: null
    }
  ]
}
```


### Notes
> As with all &ldquo;via-less&rdquo; plural associations, reflexive via-less associations are only accessible from the side on which they are declared.  In the above `User` model, you can do `User.findOne(55).populate('bookmarkedUsers')` to find all of the users that User #55 bookmarked, but there&rsquo;s no way to get a list of all of the users that have bookmarked User #55.  To do so would require an additional attribute (e.g. `bookmarkedBy`) that would be joined to `bookmarkedUsers` using the `via` property.


<docmeta name="displayName" value="Reflexive associations">

