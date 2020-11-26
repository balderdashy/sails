# sails.LOOKS_LIKE_ASSET_RX

A regular expression designed for use in identifying URL paths that seem like they are _probably_ for a static asset of some kind (e.g. image, stylesheet, `favicon.ico`, `robots.txt`, etc.).

### Usage
```usage
sails.LOOKS_LIKE_ASSET_RX;
```

**Type:** ((RegExp))

> This regex is **by no means foolproof**, and may match URLs too aggressively for some applications.  It is just a reasonable approximation made available for convenience.

### Example

To avoid disabling built-in session support for any request to a URL path that ends in `.json`, but still disable sessions for other requests for static assets, you might use the following configuration:

```javascript
// In `config/session.js`
isSessionDisabled: function (req){

  if (req.path.match(/\.json$/)) {
    // Don't disable sessions.
    return;
  }

  var seemsToWantSomeOtherStaticAsset = !!req.path.match(sails.LOOKS_LIKE_ASSET_RX);
  if (seemsToWantSomeOtherStaticAsset) {
    // Disable sessions.
    return true;
  }
  
  // Otherwise, don't disable sessions.
  return;

}
```

<docmeta name="displayName" value="sails.LOOKS_LIKE_ASSET_RX">
<docmeta name="pageType" value="constant">
