# Lifecycle callbacks

### Overview

Lifecycle callbacks are functions that are called before or after certain model methods.  For example, you might use lifecycle callbacks to automatically compute the value of a `fullName` attribute before creating or updating a `User` record.

Sails exposes a handful of lifecycle callbacks by default:

##### Lifecycle callbacks on `.create()`

The `afterCreate` lifecycle callback will only be run on queries that have the `fetch` meta flag set to `true`. For more information on using the `meta` flags, see [Waterline Queries](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).

  - beforeCreate: fn(recordToCreate, proceed)
  - afterCreate: fn(newlyCreatedRecord, proceed)

> `beforeCreate` is also run on bulk inserts of data when you call `.createEach()`. However, `afterCreate` is **not**.

##### Lifecycle callbacks on `.update()`

The `afterUpdate` lifecycle callback will only be run on `.update()` queries that have the `fetch` meta flag set to `true`. For more information on using the `meta` flags, see [Waterline Queries](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).

  - beforeUpdate: fn(valuesToSet, proceed)
  - afterUpdate: fn(updatedRecord, proceed)

##### Lifecycle callbacks on `.destroy()`

The `afterDestroy` lifecycle callback will only be run on `.destroy()` queries that have the `fetch` meta flag set to `true`. For more information on using the `meta` flags, see [Waterline Queries](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta).

  - beforeDestroy: fn(criteria, proceed)
  - afterDestroy: fn(destroyedRecord, proceed)


### Example

If you want to hash a password before saving in the database, you might use the `beforeCreate` lifecycle callback.

```javascript
// User.js
module.exports = {

  attributes: {

    username: {
      type: 'string',
      required: true
    },

    password: {
      type: 'string',
      minLength: 6,
      required: true
    }

  },


  beforeCreate: function (valuesToSet, proceed) {
    // Hash password
    sails.helpers.passwords.hashPassword(valuesToSet.password).exec((err, hashedPassword)=>{
      if (err) { return proceed(err); }
      valuesToSet.password = hashedPassword;
      return proceed();
    });//_∏_
  }
  
};
```


<docmeta name="displayName" value="Lifecycle callbacks">
