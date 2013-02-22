Inspired by our pals over at Grails, introducing dynamic finders...

## Dynamic finders

`User.findByEmail(req.param('login'),cb);` is equivalent to:
```
User.find({
  email: req.param('login')
},cb);
```



## findBy*In() and findAllBy*In()
findBy*In and findAll*ByIn methods are exactly the same as findBy*() and findAllBy*()-- they're just here as shortcuts to make your code more literate.

For instance
`User.findALlByNameIn(['Pearl','Alex','Elazul'],cb);` is equivalent to:
```
User.findAll({
  name: ['Pearl','Alex','Elazul']
},cb);
```


## findBy*Like() and findAllBy*Like()

findBy*Like() and findAllBy*Like() are shortcuts for LIKE queries.  They allow you to search for models with values which are close matches (substrings) to what you specify.  For example:

`User.findALlByNameLike('Sarah',cb);` is equivalent to:
```
User.findAll({
  like: {
    email: req.param('login')
  }
},cb);
```