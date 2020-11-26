# `.decrypt()`

Decrypt any auto-encrypted attributes in the records returned for this particular query.


```usage
query.decrypt()
```

### Usage

This method doesn't accept any arguments.


### Example
To retrieve user records with `ssn` decrypted:
```javascript
await User.find({fullName: 'Finn Mertens'}).decrypt();
// =>
// [ { id: 4, fullName: 'Finn Mertens', ssn: '555-55-5555' } ]
```
If the records were retrieved without `.decrypt()`, you would get:
```javascript
await User.find({fullName: 'Finn Mertens'});
// =>
// [ { id: 4, fullName: 'Finn Mertens', ssn: 'YWVzLTI1Ni1nY20kJGRlZmF1bHQ=$F4Du3CAHtmUNk1pn$hMBezK3lwJ2BhOjZ$6as+eXnJDfBS54XVJgmPsg' } ]
```

### Notes
> * This is just a shortcut for [`.meta({decrypt: true})`](https://sailsjs.com/documentation/reference/waterline-orm/queries/meta)

<docmeta name="displayName" value=".decrypt()">
<docmeta name="pageType" value="method">
