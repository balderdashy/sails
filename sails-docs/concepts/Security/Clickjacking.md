# Clickjacking


[Clickjacking](https://www.owasp.org/index.php/Clickjacking) (aka "UI redress attacks") happens when an attacker manages to trick your users into triggering "unintended" UI events (e.g. DOM events).



### X-FRAME-OPTIONS

One simple way to help prevent clickjacking attacks is to enable the X-FRAME-OPTIONS header.

##### Using [lusca](https://github.com/krakenjs/lusca#luscaxframevalue)

> `lusca` is open-source under the [Apache license](https://github.com/krakenjs/lusca/blob/master/LICENSE.txt)

First: 

```sh
# In your sails app
npm install lusca --save
```

Then, in the `middleware` config object in `config/http.js`:

```js
  // ...
  // maxAge ==> Number of seconds strict transport security will stay in effect.
  xframe: require('lusca').xframe('SAMEORIGIN'),
  // ...
  order: [
    // ...
    'xframe'
    // ...
  ]
```



### Additional Resources
+ [Clickjacking (OWasp)](https://www.owasp.org/index.php/Clickjacking)




<docmeta name="displayName" value="Clickjacking">
<docmeta name="tags" value="clickjacking,ui redress attack">
