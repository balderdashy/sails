# `res.send()`

Send a string response in a format other than JSON (XML, CSV, plain text, etc.).

This method is used in the underlying implementation of most of the other terminal response methods.

### Usage
```usage
return res.send([string]);
```

### Details

This method can be used to send a string of XML.

If no argument is provided, no response body is sent back&mdash;just the status code.

### Examples

To allow users to export their own data, while complying with Europe's GDPR regulations, you might send back some dynamic CSV-formatted data, like this:

```javascript
// Send back some dynamic CSV-formatted data.
return res.set('text/csv').send(`
some,csv,like,this
or,,like,this
`);
```

Or, to respond with XML (e.g. for a sitemap):

```javascript
// Send down some dynamic XML-formatted data.
return res.set('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://sailsjs.com</loc>
    <lastmod>2018-03-28T17:02:23.688Z</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
`);
```

You can also send arbitrary plain text and use any status code you like:

```javascript
// You can use any status code you like.
// (Defaults to 200 unless you specify something else.)
return res.status(420).send('Hello world!');
```


### Notes
> + This method is **terminal**, meaning that it's generally the last line of code your app should run for a given request (hence the advisory usage of `return` throughout these docs).
> + If you want to send a dictionary or JSON, use [`res.json()`](https://sailsjs.com/documentation/reference/response-res/res-json).
> + If you want to send a stream, use [actions2](https://sailsjs.com/documentation/concepts/actions-and-controllers)(preferably) or `.pipe(res)` (if you absolutely must).
> + If you want to send a custom status code, call [`req.status()`](https://sailsjs.com/documentation/reference/response-res/res-status) first.



<docmeta name="displayName" value="res.send()">

<docmeta name="pageType" value="method">

