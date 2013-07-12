## What About i18n on the client?


```
* The above technique works great out of the box for server-side views.
* But what about rich client apps?  HTML 5, SPAs, PhoneGap, Chrome Extensions and stuff?
* What if your HTML templates are being served from a CDN?
*
* If you are using **client-side** templates, you can reuse Sails' i18n support
* to help you get your translated templates to the browser.  
*
* If you want to use Sails to internationalize your client-side templates, just 
* put your front-end templates in a subdirectory of your app's `/views` folder.
*	+ In development mode, you should retranslate and precompile your templates each time
*	  the relevant stringfile or template changes using grunt-contrib-watch, which is
*	  already installed by default in new Sails projects.
*	+ In production mode, you'll want to translate and precompile all templates on lift().
*	  In loadtime-critical scenarios (e.g. mobile web apps) you can even upload your translated,
*	  precompiled, minified templates to a CDN like Cloudfront for further performance gains.
*
* Alternatively, if you're writing a native Objective C or Android application, 
* you may find the following resources helpful:
* + Apple's Official i18n Docs for iOS
*	https://developer.apple.com/library/ios/#documentation/MacOSX/Conceptual/BPInternational/BPInternational.html
* + Google's Official i18n Docs for Android
*	http://developer.android.com/guide/topics/resources/localization.html
*
*/
```