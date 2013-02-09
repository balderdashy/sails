# Criteria Options

## limit: n
Default: null

- !!n == 0: Return everything.
- Otherwise return up to n models.

## skip: n
Default: 0

- !!n == 0: Skip nothing (start at first record)
- Otherwise start at the nth record.

## sort: x
Default: null

- !!x == 0: Sort by primary key, ASC.
- If a string is specified of the form `attrName ASC` or `attrName DESC`, the results will be sorted by attrName either ASC or DESC.
- If a string with no spaces is found, the results will be sorted by attrName ASC.
- Otherwise if an object is provided, sort by the attributes specified.  Will sort ascending if the given value in the object is === 1 and descending if it's === -1.  Sort priority is order of keys.  i.e.:
```
sort: {
  name: 1,
  dateCreated: -1
}
```

