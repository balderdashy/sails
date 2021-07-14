# P3P

### Background

P3P stands for the "Platform for Privacy Preferences" and is a browser/web standard designed to facilitate better consumer web privacy control.  Currently (as of 2014), out of all the major browsers, only Internet Explorer supports it.  P3P most often comes into play when dealing with legacy applications.

Many modern organizations are willfully ignoring P3P. Here's what [Facebook has to say](https://www.facebook.com/help/327993273962160/) on the subject:

> The organization that established P3P, the World Wide Web Consortium, suspended its work on this standard several years ago because most modern web browsers don't fully support P3P. As a result, the P3P standard is now out of date and doesn't reflect technologies that are currently in use on the web, so most websites currently don't have P3P policies.
> 
> See also: http://www.zdnet.com/blog/facebook/facebook-to-microsoft-p3p-is-outdated-what-else-ya-got/9332


### Supporting P3P with Sails

All of that aside, sometimes you have to support P3P anyways.

Fortunately, a few different modules exist that bring P3P support to Express and Sails by enabling the relevant P3P headers.  To use one of these modules for handling P3P headers, install it from npm using the directions below, then open `config/http.js` in your project and configure it as a custom middleware.  To do that, define your P3P middleware as "p3p", and add the string "p3p" to your `middleware.order` array wherever you'd like it to run in the middleware chain (a good place to put it might be right before `cookieParser`):

E.g. in `config/http.js`:

```js
// .....
module.exports.http = {

  middleware: {
  
    p3p: require('p3p')(p3p.recommmended), // <==== set up the custom middleware here and named it "p3p"

    order: [
      'startRequestTimer',
      'p3p', // <============ configured the order of our "p3p" custom middleware here
      'cookieParser',
      'session',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ],
    // .....
  }
};
```


Check out the examples below for more guidance, and be sure and follow the links to see the docs for the module you're using for the latest information, comparative analysis of its features, any recent bug fixes, and advanced usage details.


##### Using [node-p3p](https://github.com/troygoode/node-p3p)

> `node-p3p` is open-source under the [MIT license](https://github.com/troygoode/node-p3p/blob/master/LICENSE).

```sh
# In your sails app
npm install p3p --save
```

Then in the `middleware` config object in `config/http.js`:

```js
  // ...
  // node-p3p provides a recommended compact privacy policy out of the box
  p3p: require('p3p')(require('p3p').recommended)
  // ...
```


##### Using [lusca](https://github.com/krakenjs/lusca#luscap3pvalue)

> `lusca` is open-source under the [Apache license](https://github.com/krakenjs/lusca/blob/master/LICENSE.txt)

```sh
# In your sails app
npm install lusca --save
```

Then in the `middleware` config object in `config/http.js`:

```js
  // ...
  // "ABCDEF" ==> The compact privacy policy to use.
  p3p: require('lusca').p3p('ABCDEF')
  // ...
```


### Additional Resources: 

+ [Description of the P3P Project (Microsoft)](http://support.microsoft.com/kb/290333)
+ ["P3P Work suspended" (W3C)](http://www.w3.org/P3P/)
+ [P3P Compact Specification (CompactPrivacyPolicy.org)](http://compactprivacypolicy.org/compact_specification.htm)


<docmeta name="displayName" value="P3P">

