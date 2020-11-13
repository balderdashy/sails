# Through associations

**AKA "has many through"**

### Overview

Many-to-many through associations behave in the same way as many-to-many associations, except that in a many-to-many through association, the join table is created automatically. In a many-to-many through assocation, you define a model containing two fields that correspond to the two models you will be joining together. When defining an association, you will add the `through` key to show that the model should be used instead of the automatic join table.

### Has many through example

```javascript
// myApp/api/models/User.js
module.exports = {
  attributes: {
    name: {
      type: 'string'
    },
    pets:{
      collection: 'pet',
      via: 'owner',
      through: 'petuser'
    }
  }
}
```

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
    owners:{
      collection: 'user',
      via: 'pet',
      through: 'petuser'
    }
  }
}
```

```javascript
// myApp/api/models/PetUser.js
module.exports = {
  attributes: {
    owner:{
      model:'user'
    },
    pet: {
      model: 'pet'
    }
  }
}
```

By using the `PetUser` model, we can use [`.populate()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/populate) on both the `User` model and `Pet` model just as we do in a normal [many-to-many](https://sailsjs.com/documentation/concepts/models-and-orm/associations/many-to-many) association.

> Currently, if you would like to add additional information to the `through` table, it will not be available when calling `.populate`. To do this you will need to query the `through` model manually.



<docmeta name="displayName" value="Through associations">

