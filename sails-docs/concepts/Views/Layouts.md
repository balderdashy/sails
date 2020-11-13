# Layouts

When building an app with many different pages, it can be helpful to extrapolate markup shared by several HTML files into a layout.  This [reduces the total amount of code](http://en.wikipedia.org/wiki/Don't_repeat_yourself) in your project and helps you avoid making the same changes in multiple files down the road.

In Sails and Express, layouts are implemented by the view engines themselves.  For instance, `jade` has its own layout system, with its own syntax.

For convenience, Sails bundles special support for layouts **when using the default view engine, EJS**. If you'd like to use layouts with a different view engine, check out [that view engine's documentation](https://sailsjs.com/documentation/concepts/views/view-engines) to find the appropriate syntax.


### Creating layouts

Sails layouts are special `.ejs` files in your app's `views/` folder you can use to "wrap" or "sandwich" other views. Layouts usually contain the preamble (e.g. `<!DOCTYPE html><html><head>....</head><body>`) and conclusion (`</body></html>`).  The original view file is included using `<%- body %>`.  Layouts are never used without a view: that would be like serving someone a bread sandwich.

Layout support for your app can be configured or disabled in [`config/views.js`](https://sailsjs.com/documentation/anatomy/config/views.js), and it can be overridden for a particular route or action by setting a special [local](https://sailsjs.com/documentation/concepts/views/locals) called `layout`. By default, Sails will compile all views using the layout located at `views/layouts/layout.ejs`.

To specify what layout a view uses, see the example below. There is more information in the docs at [routes](https://sailsjs.com/documentation/concepts/routes).

The example route below will use the view located at `./views/users/privacy.ejs` within the layout located at `./views/users.ejs`

```javascript
'get /privacy': {
    view: 'users/privacy',
    locals: {
      layout: 'users'
    }
  },
```

The example controller action below will use the view located at `./views/users/privacy.ejs` within the layout located at `./views/users.ejs`

```javascript
privacy: function (req, res) {
  res.view('users/privacy', {layout: 'users'})
}
```

### Notes

> #### Why do layouts only work for EJS?
> A couple of years ago, built-in support for layouts/partials was deprecated in Express. Instead, developers were expected to rely on the view engines themselves to implement this feature. (See https://github.com/balderdashy/sails/issues/494 for more information.)
>
> Sails supports the legacy `layouts` feature for convenience, backwards compatibility with Express 2.x and Sails 0.8.x apps, and in particular, familiarity for new community members coming from other MVC frameworks. As a result, layouts have only been tested with the default view engine (ejs).
>
> If layouts aren&rsquo;t your thing, or (for now) if you&rsquo;re using a server-side view engine other than ejs, (e.g. Jade, handlebars, haml, dust) you&rsquo;ll want to set `layout:false` in [`sails.config.views`](https://sailsjs.com/documentation/reference/configuration/sails-config-views) and rely on your view engine&rsquo;s custom layout/partial support.





<docmeta name="displayName" value="Layouts">
