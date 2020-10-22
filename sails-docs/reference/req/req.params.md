# `req.params`

An object containing parameter values parsed from the URL path.

For example if you have the route `/user/:name`, then the "name" from the URL path wil be available as `req.params.name`.  This object defaults to `{}`.


### Usage

```usage
req.params;
```

### Notes
> + When a route address is defined using a regular expression, each capture group match from the regex is available as `req.params[0]`, `req.params[1]`, etc. This strategy is also applied to unnamed wild-card matches in string routes such as `/file/*`.







<docmeta name="displayName" value="req.params">
<docmeta name="pageType" value="property">
