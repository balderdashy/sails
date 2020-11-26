# URL slugs
A common use case for explicit routes is the design of slugs or [vanity URLs](http://en.wikipedia.org/wiki/Clean_URL#Slug).  For example, consider the URL of a repository on Github, [`http://www.github.com/balderdashy/sails`](http://www.github.com/balderdashy/sails).  In Sails, we might define this route at the **bottom of our `config/routes.js` file** like so:

```javascript
'get /:account/:repo': {
  controller: 'RepoController',
  action: 'show',
  skipAssets: true
}
```

In your `RepoController`'s `show` action, we'd use `req.param('account')` and `req.param('repo')` to look up the data for the appropriate repository, then pass it in to the appropriate [view](https://sailsjs.com/documentation/concepts/Views) as [locals](https://sailsjs.com/documentation/concepts/views/locals).  The [`skipAssets` option](https://sailsjs.com/documentation/concepts/routes/custom-routes#?route-target-options) ensures that the vanity route doesn't accidentally match any of our [assets](https://sailsjs.com/documentation/concepts/assets) (e.g. `/images/logo.png`), so they are still accessible.


## Slugs that might contain slashes

There is one particular case where the simple implementation of URL pattern variables (e.g. `:foo`) is not enough.

If your application will tolerate slugs containing unescaped forward slash (`/`) characters, then instead of addressing the dynamic parts of your route address path using pattern variables like `:foo`, you will need to use a URL wildcard suffix (`*`).

For example:

```javascript
'get /admin/email-template-previews/*': {
  action: 'admin/view-email-template-preview',
  skipAssets: true
}
```

To receive the runtime value corresponding with this wildcard (`*`) in a [modern Sails action](https://sailsjs.com/documentation/concepts/actions-and-controllers#?what-does-an-action-file-look-like), use `urlWildcardSuffix` at the top level of your action definition to indicate the name of the input you would like to use to represent the dynamic value:


```javascript
urlWildcardSuffix: 'template',
inputs: {
  template: {
    description: 'The relative path to an EJS template within our `views/emails/` folder -- WITHOUT the file extension.',
    extendedDescription: 'Use strings like "foo" or "foo/bar", but NEVER "foo/bar.ejs" or "/foo/bar".  For example, '+
      '"internal/email-contact-form" would send an email using the "views/emails/internal/email-contact-form.ejs" template.',
    example: 'email-reset-password',
    type: 'string',
    required: true
  },
},
fn: async function({ template }) {
  // …
}
```


### Notes
> - Alternatively, in a classic (req,res) action, you can use `req.param('0')` to access the dynamic value of a route's URL wildcard suffix (`*`).
> - For more background, see https://www.npmjs.com/package/machine-as-action



<docmeta name="displayName" value="URL slugs">
