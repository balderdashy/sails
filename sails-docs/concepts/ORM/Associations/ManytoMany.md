# Many-to-many

**AKA "Has and Belongs To Many"**

### Overview

A many-to-many association states that one record can be associated with many other records and vice-versa.  This type of relationship involves the creation of a _join table_ to keep track of the many links between records.  When Waterline detects that two models have collection attributes that point to each other through their `via` keys (see below), it will automatically build up a join table for you.

### The `via` key

Because you may want a model to have multiple many-to-many associations on another model a `via` key is needed on the `collection` attribute. The `via` key indicates the related attribute on the other side of a many-to-many association.

Using the `User` and `Pet` example, let&rsquo;s look at how to build a schema where a `User` may have many `Pet` records and a `Pet` may have multiple owners.

```javascript
// myApp/api/models/User.js
// A user may have many pets
module.exports = {
  attributes: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },

    // Add a reference to Pet
    pets: {
      collection: 'pet',
      via: 'owners'
    }
  }
};
```
```javascript
// myApp/api/models/Pet.js
// A pet may have many owners
module.exports = {
  attributes: {
    breed: {
      type: 'string'
    },
    type: {
      type: 'string'
    },
    name: {
      type: 'string'
    },

    // Add a reference to User
    owners: {
      collection: 'user',
      via: 'pets'
    }
  }
};
```

To associate records together, the Model method [.addToCollection()](https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection) is used. This allows you to set the primary keys of the records that will be associated.

```javascript
// To add a Pet to a user's `pets` collection where the User has an id of
// 10 and the Pet has an id of 300.
await User.addToCollection(10, 'pets', 300);
```

You can also add multiple pets at once:

```javascript
await User.addToCollection(10, 'pets', [300, 301]);
```

Removing associations is just as easy using the [.removeFromCollection()](https://sailsjs.com/documentation/reference/waterline-orm/models/remove-from-collection) method. It works the same way as  `addToCollection`:

```javascript
// To remove a User from a pet's collection of owners where the User has an id of
// 10 and the Pet has an id of 300.
await Pet.removeFromCollection(300, 'owners', 10);
```

And you can remove multiple owners at once:

```javascript
await Pet.removeFromCollection(300, 'owners', [10, 12]);
```

Note that adding or removing associated records from one side of a many-to-many relationship will automatically affect the other side.  For example, adding records to the `pets` attribute of a `User` model record with `.addToCollection()` will immediately affect the `owners` attributes of the linked `Pet` records.

To return associated collections along with a record retrieved by [`.find()`](https://sailsjs.com/documentation/reference/waterline-orm/models/find) or [`.findOne()`](https://sailsjs.com/documentation/reference/waterline-orm/models/find-one), use the [`.populate()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/populate) method.

### Dominance

In most cases, Sails will be able to create the join table for a many-to-many association without any input from you.  However, if the two models in the association use different datastores, you may want to choose which one should contain the join table.  You can do this by setting `dominant: true` on one of the associations in the relationship.

Consider the following models:


```javascript
// User.js
module.exports = {
  datastore: 'ourMySQL',
  attributes: {
    email: 'string',
    wishlist: {
      collection: 'product',
      via: 'wishlistedBy'
    }
  }
};
```


```javascript
// Product.js
module.exports = {
  datastore: 'ourRedis',
  attributes: {
    name: 'string',
    wishlistedBy: {
      collection: 'user',
      via: 'wishlist'
    }
  }
};
```

In this case, `User` and `Product` records exist in different databases.  By default, Sails will arbitrarily choose one of the datastores (either `ourMySQL` or `ourRedis`) to contain the join table linking the `wishlist` attribute of `User` to the `wishlistedBy` attribut of `Product`.  In order to force the join table to exist in the `ourMySQL` datastore, you would add `dominant: true` to the `wishlist` attribute definition.  Conversely, adding `dominant: true` to the `wishlistedBy` attribute would cause the join table to be created in the `ourRedis` datastore.


##### Choosing a "dominant"

Several factors may influence your decision of where to create the join table:

+ If one side is a SQL database, placing the join table on that side will allow your queries to be more efficient, since the relationship table can be joined before the other side is communicated with.  This reduces the number of total queries required from 3 to 2.
+ If one datastore is much faster than the other, all other things being equal, it probably makes sense to put the join table on that side.
+ If you know that it is much easier to migrate one of the datastores, you may choose to set that side as `dominant`.  Similarly, regulations or compliance issues may affect your decision as well.  If the relationship contains sensitive patient information (for instance, a relationship between `Patient` and `Medicine`) you want to be sure that all relevant data is saved in one particular database over the other (in this case, `Patient` is likely to be `dominant`).
+ Along the same lines, if one of your datastores is read-only (perhaps `Medicine` in the previous example is connected to a read-only vendor database), you won't be able to write to it, so you'll want to make sure your relationship data can be persisted safely on the other side.

<docmeta name="displayName" value="Many-to-many">

