## Basic Usage

##### Simplest case-- no criteria
```javascript
// Defaults to primary key as Organization.id and foreign key as User.OrganizationId
User.join(Organization,cb);
```
##### `SELECT * FROM User INNER JOIN Organization ON User.OrganizationId=Organization.id WHERE User.name='Gabe Hernandez'`
```javascript
// Now let's try it with a criteria (same default PK and FK)
User.findAllByName('Gabe Hernandez').join(Organization,cb);
```

##### `User INNER JOIN Organization ON User.OrganizationId=Organization.id`
```javascript
// And with more chaining
User.findAllByName('Gabe Hernandez').join(Organization).done(cb);
```


## Custom keys
##### `User INNER JOIN Organization ON User.companyid=Organization.id`
```javascript
// Custom foreign key
User.findAllByName('Gabe Hernandez').join(Organization, 'User.companyid', cb);
```

##### `User INNER JOIN Organization ON User.companyid=Organization.uuid`
```javascript
// Custom foreign key and primary key
User.findAllByName('Gabe Hernandez').join(Organization, 'companyid', 'uuid',cb);
```

## Outer Joins

##### `User LEFT OUTER JOIN Organization ON User.OrganizationId=Organization.id`
```javascript
// Left outer join
User.findAllByName('Gabe Hernandez').leftOuterJoin(Organization, 'companyid', 'uuid', cb);
```

##### `User RIGHT OUTER JOIN Organization ON User.OrganizationId=Organization.id`
```javascript
// Right outer join
User.findAllByName('Gabe Hernandez').rightOuterJoin(Organization, 'companyid', 'uuid', cb);
```

## Custom join function
##### `User INNER JOIN Organization ON User.OrganizationId=Organization.id`
```javascript
// Use a custom user function to perform the join (instead of using the adapter's
// (kept the same query as the first one in this note for simplicity)
User.findAllByName('Gabe Hernandez').join(Organization,function (user, organization) {
  return user.OrganizationId === organization.id;
}, cb);
```