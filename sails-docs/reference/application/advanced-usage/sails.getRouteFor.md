# sails.getRouteFor()

Look up the first route pointing at the specified target (e.g. `MeController.login`) and return a dictionary containing its method and URL.



```usage
sails.getRouteFor(target);
```


### Usage


|   |       Argument             | Type                | Details
|---|--------------------------- | ------------------- |:-----------
| 1 |      target                | ((string))          | The route target string; e.g. `MeController.login`


#### Returns

**Type:** ((dictionary))

```javascript
{
  method: 'post',
  url: '/auth/login'
}
```



### Example

In a controller action...
```javascript
return res.view('pages/some-page-with-a-form-on-it', {
  formEndpoint: sails.getRouteFor('SomeotherController.someAction'),
  // ...
});
```

So that in the rendered view...
```ejs
<form action="<%=formEndpoint.url%>" method="<%=formEndpoint.method%>">
  <!-- ... -->
</form>
```

### Notes
> - This function searches the Sails app's explicitly configured routes; [`sails.config.routes`](https://sailsjs.com/documentation/reference/configuration/sails-config-routes).  Shadow routes bound by hooks (including [blueprint routes](https://sailsjs.com/documentation/reference/blueprint-api#?blueprint-routes)) will not be matched.
> - If a matching target cannot be found, this function throws an `E_NOT_FOUND` error (i.e. if you catch the error and check its `code` property, it will be the string `E_NOT_FOUND`).
> - If more than one route matches the specified target, the first match is returned.
> - If you only need the URL for a route (e.g. to use as an `href` from within one of your views), you may want to use [`sails.getUrlFor()`](https://sailsjs.com/documentation/reference/application/sails-get-url-for) instead of this function.

<docmeta name="displayName" value="sails.getRouteFor()">
<docmeta name="pageType" value="method">

