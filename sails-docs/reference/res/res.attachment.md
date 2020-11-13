# `res.attachment()`

Indicate to a web browser or other user agent that an outgoing file download sent in this response should be "Saved as..." rather than "Opened", and optionally specify the name for the newly downloaded file on disk.

Specifically, this sets the "Content-Disposition" header of the current response to "attachment". If a `filename` is given, then the "Content-Type" will be automatically set based on the extension of the file (e.g. `.jpg` or `.html`), and the "Content-Disposition" header will be set to "filename=`filename`".

### Usage
```usage
res.attachment([filename]);
```

### Example

This method should be called prior to streaming down the bytes of your file.

For example, if you're using the [uploads hook](https://www.npmjs.com/package/sails-hook-uploads) with [actions2](https://sailsjs.com/documentation/concepts/actions-and-controllers#?actions-2):

```js
fn: async function({id}, exits) {
  var file = await LegalDoc.findOne({ id });
  if(!file) { throw 'notFound'; }
  
  this.res.attachment(file.downloadName);
  var downloading = await sails.startDownload(file.uploadFd);
  return exits.success(downloading);
}
```

That's it!  When accessed in a browser, the file downloaded by this action will be saved as a new file (e.g. "Tax Return (Lerangis, 2019)") instead of being directly opened in the browser itself.

Under the covers, `res.attachment()` isn't doing anything fancy, it just sets response headers:

```javascript
res.attachment();
// -> response header will contain:
//   Content-Disposition: attachment
```

```javascript
res.attachment('Tax Return (Lerangis, 2019).pdf');
// -> response header will contain:
//   Content-Disposition: attachment; filename="Tax Return (Lerangis, 2019).pdf"
//   Content-Type: application/pdf
```





<docmeta name="displayName" value="res.attachment()">
<docmeta name="pageType" value="method">
