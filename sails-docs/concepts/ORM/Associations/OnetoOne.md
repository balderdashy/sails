# One-to-one

**AKA "has one"**

### Overview

A one-to-one association states that a model may only be associated with one other model. In order
for the model to know which other model it is associated with, a foreign key must be included on one of the
records along with a `unique` database constraint on it.

There are currently two ways of handling this association in Waterline.

### Has one using a collection

In this example, we are associating a `Pet` with a `User`. The `User` may only have one `Pet`, and a `Pet` can only have one `User`. However, in order to query from both sides in this example, we must add a `collection` attribute to the `User` model. This allows us to call both `User.find().populate('pet')` along with `Pet.find().populate('owner')`.

The two models will stay in sync by updating the `Pet` model's `owner` attribute. Adding the `unique` property ensures that only one value for each `owner` will exist in the database. The downside is that when populating from the `User` side, you will always get an array back.

```javascript
// myApp/api/models/Pet.js
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    color: {
      type: 'string'
    },
    owner:{
      model:'user',
      unique: true
    }
  }
}
```

```javascript
// myApp/api/models/User.js
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    },
    pet: {
      collection:'pet',
      via: 'owner'
    }
  }
}
```

### Has one manual sync

In this example, we are associating a `Pet` with a `User`. The `User` may only have one `Pet` and a `Pet` can only have one `User`. However, in order to query from both sides, a `model` property is added to the `User` model. This allows us to call both `User.find().populate('pet')` along with `Pet.find().populate('owner')`.

Note that the two models will not stay in sync, so when updating one side you must remember to update the other side as well.

```javascript
// myApp/api/models/Pet.js
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    color: {
      type: 'string'
    },
    owner:{
      model:'user'
    }
  }
}
```

```javascript
// myApp/api/models/User.js
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    age: {
      type: 'number'
    },
    pet: {
      model:'pet'
    }
  }
}
```

<docmeta name="displayName" value="One-to-one">

