# Waterline query language

The syntax supported by Sails' model methods is called Waterline Query Language.  Waterline knows how to interpret this syntax to retrieve or mutate records from any supported database.  Under the covers, Waterline uses the database adapter(s) installed in your project to translate this language into native queries and send those queries to the appropriate database.  This means that you can use the same query with MySQL as you do with Redis or MongoDB. It also means that you can change your database with minimal (if any) changes to your application code.


### Query language basics

The criteria objects are formed using one of four types of object keys. These are the top level
keys used in a query object. They are loosely based on the criteria used in MongoDB, with a few slight variations.

Queries can be built using either a `where` key to specify attributes, or excluding it.

Using the `where` key allows you to also use [query options](https://sailsjs.com/documentation/concepts/models-and-orm/query-language#query-options), such as `limit`, `skip`, and `sort`.


```javascript
var thirdPageOfRecentPeopleNamedMary = await Model.find({
  where: { name: 'mary' },
  skip: 20,
  limit: 10,
  sort: 'createdAt DESC'
});
```
Constraints can be further joined together in a more complex example.

```javascript
var teachersNamedMaryInMaine = await Model.find({
  where: { name: 'mary', state: 'me', occupation: { contains: 'teacher' } },
  sort: [{ firstName: 'ASC'}, { lastName: 'ASC'}]
});
```

If `where` is excluded, the entire object will be treated as a `where` criteria.

```javascript
var peopleNamedMary = await Model.find({
  name: 'mary'
});
```

#### Key pairs

A key pair can be used to search records for values matching exactly what is specified. This is the base of a criteria object where the key represents an attribute on a model and the value is a strict equality check of the records for matching values.

```javascript
var peopleNamedLyra = await Model.find({
  name: 'lyra'
});
```

They can be used together to search multiple attributes.

```javascript
var waltersFromNewMexico = await Model.find({
  name: 'walter',
  state: 'new mexico'
});
```

#### Complex constraints

Complex constraints also have model attributes for keys but they also use any of the supported criteria modifiers to perform queries where a strict equality check wouldn't work.

```javascript
var peoplePossiblyNamedLyra = await Model.find({
  name : {
    'contains' : 'yra'
  }
});
```

#### In modifier

Provide an array to find records whose value for this attribute exactly matches _any_ of the specified search terms.

> This is more or less equivalent to "IN" queries in SQL, and the `$in` operator in MongoDB.

```javascript
var waltersAndSkylers = await Model.find({
  name : ['walter', 'skyler']
});
```

#### Not-in modifier

Provide an array wrapped in a dictionary under a `!=` key (like `{ '!=': [...] }`) to find records whose value for this attribute _ARE NOT_ exact matches for any of the specified search terms.

> This is more or less equivalent to "NOT IN" queries in SQL, and the `$nin` operator in MongoDB.

```javascript
var everyoneExceptWaltersAndSkylers = await Model.find({
  name: { '!=' : ['walter', 'skyler'] }
});
```

#### Or predicate

Use the `or` modifier to match _any_ of the nested rulesets you specify as an array of query pairs.  For records to match an `or` query, they must match at least one of the specified query modifiers in the `or` array.

```javascript
var waltersAndTeachers = await Model.find({
  or : [
    { name: 'walter' },
    { occupation: 'teacher' }
  ]
});
```

### Criteria modifiers

The following modifiers are available to use when building queries.

* `'<'`
* `'<='`
* `'>'`
* `'>='`
* `'!='`
* `nin`
* `in`
* `contains`
* `startsWith`
* `endsWith`

> Note that the availability and behavior of the criteria modifiers when matching against attributes with [JSON attributes](https://sailsjs.com/documentation/concepts/models-and-orm/validations#?builtin-data-types) may vary according to the database adapter you&rsquo;re using.  For instance, while `sails-postgresql` will map your JSON attributes to the <a href="https://www.postgresql.org/docs/9.4/static/datatype-json.html" target="_blank">JSON column type</a>, you&rsquo;ll need to [send a native query](https://sailsjs.com/documentation/reference/waterline-orm/datastores/send-native-query) in order to query those attributes directly.  On the other hand, `sails-mongo` supports queries against JSON-type attributes, but you should be aware that if a field contains an array, the query criteria will be run against every _item_ in the array, rather than the array itself (this is based on the behavior of MongoDB itself).

#### '<'

Searches for records where the value is less than the value specified.

```usage
Model.find({
  age: { '<': 30 }
});
```

#### '<='

Searches for records where the value is less or equal to the value specified.

```usage
Model.find({
  age: { '<=': 20 }
});
```

#### '>'

Searches for records where the value is greater than the value specified.

```usage
Model.find({
  age: { '>': 18 }
});
```

#### '>='

Searches for records where the value is greater than or equal to the value specified.

```usage
Model.find({
  age: { '>=': 21 }
});
```

#### '!='

Searches for records where the value is not equal to the value specified.

```usage
Model.find({
  name: { '!=': 'foo' }
});
```

#### in

Searches for records where the value is in the list of values.

```usage
Model.find({
  name: { in: ['foo', 'bar'] }
});
```

#### nin

Searches for records where the value is NOT in the list of values.

```usage
Model.find({
  name: { nin: ['foo', 'bar'] }
});
```

#### contains

Searches for records where the value for this attribute _contains_ the given string.

```usage
var musicCourses = await Course.find({
  subject: { contains: 'music' }
});
```

_For performance reasons, case-sensitivity of `contains` depends on the database adapter._

#### startsWith

Searches for records where the value for this attribute _starts with_ the given string.

```usage
var coursesAboutAmerica = await Course.find({
  subject: { startsWith: 'american' }
});
```

_For performance reasons, case-sensitivity of `startsWith` depends on the database adapter._

#### endsWith

Searches for records where the value for this attribute _ends with_ the given string.

```usage
var historyCourses = await Course.find({
  subject: { endsWith: 'history' }
});
```

_For performance reasons, case-sensitivity of `endsWith` depends on the database adapter._


### Query options

Query options allow you refine the results that are returned from a query. They are used
in conjunction with a `where` key. The current options available are:

* `limit`
* `skip`
* `sort`

#### Limit

Limits the number of results returned from a query.

```usage
Model.find({ where: { name: 'foo' }, limit: 20 });
```

> Note: if you set `limit` to 0, the query will always return an empty array.

#### Skip

Returns all the results excluding the number of items to skip.

```usage
Model.find({ where: { name: 'foo' }, skip: 10 });
```

##### Pagination

`skip` and `limit` can be used together to build up a pagination system.

```usage
Model.find({ where: { name: 'foo' }, limit: 10, skip: 10 });
```

> **Waterline**
>
> You can find out more about the Waterline API below:
> * [Sails.js Documentation](https://sailsjs.com/documentation/reference/waterline-orm/queries)
> * [Waterline README](https://github.com/balderdashy/waterline/blob/master/README.md)
> * [Waterline Reference Docs](https://sailsjs.com/documentation/reference/waterline-orm)
> * [Waterline Github Repository](https://github.com/balderdashy/waterline)


#### Sort

Results can be sorted by attribute name. Simply specify an attribute name for natural (ascending)
sort, or specify an `ASC` or `DESC` flag for ascending or descending orders respectively.

```usage
// Sort by name in ascending order
Model.find({ where: { name: 'foo' }, sort: 'name' });

// Sort by name in descending order
Model.find({ where: { name: 'foo' }, sort: 'name DESC' });

// Sort by name in ascending order
Model.find({ where: { name: 'foo' }, sort: 'name ASC' });

// Sort by object notation
Model.find({ where: { name: 'foo' }, sort: [{ 'name': 'ASC' }] });

// Sort by multiple attributes
Model.find({ where: { name: 'foo' }, sort: [{ name:  'ASC'}, { age: 'DESC' }] });
```


<docmeta name="displayName" value="Query language">
