# IN Queries

Sometimes, you want to find models from your datasource whose values match one or more entries in a list.  This is possible using OR, but it's much literate to write using an IN query.  Here's what a couple of IN queries look like:
```
User.find({ 
  name: ['Niccolo','Diana']
}}, cb);
```

```
User.findAll({ 
  name: ['Mike','Gabe','Heather']
}}, cb);
```

Using only an OR query, we would have had to write:
```
User.find({
  or: [
    {name: 'Niccolo'},
    {name: 'Diana'}
  ]
}}, cb);
```
and
```
User.findAll({
  or: [
    {name: 'Mike'},
    {name: 'Gabe'},
    {name: 'Heather'}
  ]
}}, cb);
```

Much nicer!  And best of all, some adapters (i.e. SQL datasources) optimize for this sort of query, so using this notation may improve your performance.


## IN Queries with Dynamic Finders
One other nice trick is to use IN queries with a dynamic finder:
```
User.findAllByNameIn(['Mike','Gabe','Heather'],cb);
```
