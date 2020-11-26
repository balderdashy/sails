# Records

A _record_ is what you get back from `.find()` or `.findOne()`.  Each record is a uniquely identifiable object that corresponds one-to-one with a physical database entry; e.g. a row in Oracle/MSSQL/PostgreSQL/MySQL, a document in MongoDB, or a hash in Redis.

```js
var records = await Order.find();

console.log('Found %d records', records.length);
if (records.length > 0) {
  console.log('Found at least one record, and its `id` is:',records[0].id);
}
```


### JSON serialization

In Sails, records are just dictionaries (plain JavaScript objects), which means they can easily be represented as JSON. But you can also customize the way that records from a particular model are _stringified_ using the [`customToJSON` model setting](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?customtojson).


### Populated values

In addition to basic attribute data like email addresses, phone numbers, and birthdates, Waterline can dynamically store and retrieve linked sets of records using [associations](https://sailsjs.com/documentation/concepts/models-and-orm/associations).  When [`.populate()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/populate) is called on a query, each of the resulting records will contain one or more populated values.  Each one of those populated values is a snapshot of the record (or array of records) linked to that particular association at the time of the query.

The type of a populated value depends on what kind of association it is:

+ `null`, or a plain JavaScript object (if it corresponds to a "model" association)
+ an empty array, or an array of plain JavaScript objects (if it corresponds to a "collection" association)



For example, assuming we're dealing with orders of adorable wolf puppies:

```js
var orders = await Order.find()
.populate('buyers')  // a "collection" association
.populate('seller');  // a "model" association

// this array is a snapshot of the Customers who are associated with the first Order as "buyers"
console.log(orders[0].buyers);
// => [ {id: 1, name: 'Robb Stark'}, {id: 6, name: 'Arya Stark'} ]

// this object is a snapshot of the Company that is associated with the first Order as the "seller"
console.log(orders[0].seller);
// => { id: 42941, corporateName: 'WolvesRUs Inc.' }

// this array is empty because the second Order doesn't have any "buyers"
console.log(orders[1].buyers);
// => []

// this is `null` because there is no "seller" associated with the second Order
console.log(orders[1].seller);
// => null
```

##### Expected types / values for association attributes

The table below shows what values you can expect in records returned from a `.find()` or `.findOne()` call under different circumstances.  

| &nbsp; |  without a `.populate()` added for the association | with `.populate()`, but no associated records found | with `.populate()`, with associated records found
|:--- |:--- | --- |:--- |
| Singular association (e.g. `seller`) | Whatever is in the database record for this attribute (typically `null` or a foreign key value) | `null` | A POJO representing a child record |
| Plural association (e.g. `buyers`) |  `undefined` (the key will not be present) | `[]` (an empty array) | An array of POJOs representing child records


##### Modifying populated values

To modify the populated values of a particular record or set of records, call the [.addToCollection()](https://sailsjs.com/documentation/reference/waterline-orm/models/add-to-collection), [.removeFromCollection()](https://sailsjs.com/documentation/reference/waterline-orm/models/remove-from-collection), or [.replaceCollection()](https://sailsjs.com/documentation/reference/waterline-orm/models/replace-collection) model methods.



<docmeta name="displayName" value="Records">
