# Content security policy

[Content Security Policy (CSP)](https://www.owasp.org/index.php/Clickjacking) is a [W3C specification](https://w3c.github.io/webappsec/specs/content-security-policy) for instructing the client browser as to which location and/or which type of resources are allowed to be loaded.  This spec uses "directives" to define loading behaviors for target resource types. Directives can be specified using HTTP response headers or HTML `<meta>` tags.


### Enabling CSP

##### Using [lusca](https://github.com/krakenjs/lusca#luscacspoptions)

> `lusca` is open-source under the [Apache license](https://github.com/krakenjs/lusca/blob/master/LICENSE.txt)

First:

```sh
# In your sails app
npm install lusca --save --save-exact
```

Then add `csp` in [`config/http.js`](https://sailsjs.com/anatomy/config/http-js):

```js

  // ...

  csp: require('lusca').csp({
    policy: {
      'default-src': '*'
    }
  }),

  // ...

  order: [
    // ...
    'csp',
    // ...
  ]

```



##### Supported directives

To give you an idea how this works, here's a snapshot of supported CSP directives, as of 2017:

| Directive       | |
|:--------------- |:-------------------------- |
| default-src     | Loading policy for all resources type in case a resource type dedicated directive is not defined (fallback) |
| script-src      | Defines which scripts the protected resource can execute |
| object-src      | Defines from where the protected resource can load plugins |
| style-src       | Defines which styles (CSS) the user applies to the protected resource |
| img-src         | Defines from where the protected resource can load images |
| media-src       | Defines from where the protected resource can load video and audio |
| frame-src       | Defines from where the protected resource can embed frames |
| font-src        | Defines from where the protected resource can load fonts |
| connect-src     | Defines which URIs the protected resource can load using script interfaces |
| form-action     | Defines which URIs can be used as the action of HTML form elements |
| sandbox         | Specifies an HTML sandbox policy that the user agent applies to the protected resource |
| script-nonce    | Defines script execution by requiring the presence of the specified nonce on script elements |
| plugin-types    | Defines the set of plugins that can be invoked by the protected resource by limiting the types of resources that can be embedded |
| reflected-xss   | Instructs a user agent to activate or deactivate any heuristics used to filter or block reflected cross-site scripting attacks, equivalent to the effects of the non-standard X-XSS-Protection header |
| report-uri      | Specifies a URI to which the user agent sends reports about policy violation |

> For more information, see the [W3C CSP Spec](https://w3c.github.io/webappsec/specs/content-security-policy/).



##### Browser compatibility

Different CSP response headers are supported by different browsers.  For example, `Content-Security-Policy` is the W3C standard, but various versions of Chrome, Firefox, and IE use `X-Content-Security-Policy` or `X-WebKit-CSP`.  For the latest information on browser support, see [OWasp](https://www.owasp.org/index.php/Content_Security_Policy).



### Additional Resources
+ [Content Security Policy (OWasp)](https://www.owasp.org/index.php/Content_Security_Policy)
+ Learn more about installing HTTP middleware in [Concepts > Middleware](https://sailsjs.com/documentation/concepts/middleware).

<docmeta name="displayName" value="Content security policy">
<docmeta name="tags" value="csp,content security policy">
