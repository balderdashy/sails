# sails.getUrlFor()

Look up the first route pointing at the specified target (e.g. `entrance/view-login`) and return its URL.



```usage
sails.getUrlFor(target);
```


### Usage


|   |          Argument           | Type                | Details
|---|---------------------------- | ------------------- |:-----------
| 1 |        target               | ((string))          | The route target string; e.g. `entrance/view-login` or `PageController.login`


##### Returns

**Type:** ((string))

```javascript
'/login'
```



### Example

In a view...

```ejs
<a href="<%= sails.getUrlFor('entrance/view-login') %>">Login</a>
<a href="<%= sails.getUrlFor('entrance/view-signup') %>">Signup</a>
```

Or, if you're using traditional controllers:

```ejs
<a href="<%= sails.getUrlFor('PageController.login') %>">Login</a>
<a href="<%= sails.getUrlFor('PageController.signup') %>">Signup</a>
```

### Notes
> - This function searches the Sails app's explicitly configured routes, [`sails.config.routes`](https://sailsjs.com/documentation/reference/configuration/sails-config-routes).  Shadow routes bound by hooks (including [blueprint routes](https://sailsjs.com/documentation/reference/blueprint-api#?blueprint-routes)) will not be matched.
> - If a matching target cannot be found, this function throws an `E_NOT_FOUND` error (i.e. if you catch the error and check its `code` property, it will be the string `E_NOT_FOUND`).
> - If more than one route matches the specified target, the first match is returned.
> - The HTTP method (or "verb") from the route address is ignored, if relevant.

<docmeta name="displayName" value="sails.getUrlFor()">
<docmeta name="pageType" value="method">

