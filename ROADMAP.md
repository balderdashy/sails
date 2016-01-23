# A Sails helper function to handle untrusted bootstrap data in EJS.

```
<script type="text/javascript">
  window.SAILS_LOCALS = {
    _csrf: <%- sails.htmlInject('_csrf') %>,

    me: <%- sails.htmlInject('me') %>
  };
</script>
```

So I need to access `me` from inside of an inline `<script>` tag on an HTML page (e.g. for bootstrapping data). This would replace any custom _recursive_ HTML escaping I currently have to do on the injected value (e.g. `<%- stringifyAndHtmlEscape(me) %>`), as well as a `typeof val==='undefined' check`.

> I have the option of using the `<%= %> EJS tags`, which evaluates, escapes and injects anything between the tags or the `<%- %> EJS tags` which evaluates and injects anything between the tags as-is. I want to use `<%- %>` but then I’m responsible for protecting against potentially malicious data passed in `me`. 

## Proposed Solution

This...

```
<script type="text/javascript">
  window.SAILS_LOCALS = {
    _csrf: <%- sails.htmlInject('_csrf') %>,

    me: <%- sails.htmlInject('me') %>
  };
</script>
```

...generates this:

```
<script type="text/javascript">
  window.SAILS_LOCALS = {
    _csrf: (function (escapedValue){
      var unescaped = escapedValue;
      // Unescape all strings in `escapedValue`.
      // (recursively parse escapedValue if it is an array or dictionary)
      // (also need to prevent endless circular recursion for circular objects)
      return unescaped;
    })('d8a831-d8a8381h1-adgadga3'),

    me: (function (escapedValue){
      var unescaped = escapedValue;
      // Unescape all strings in `escapedValue`.
      // (recursively parse escapedValue if it is an array or dictionary)
      // (also need to prevent endless circular recursion for circular objects)
      return unescaped;
    })({
      gravatarUrl: '&lt;/script&gt;',
      admin: false
    })
  };
</script>
```

...and if `me` is not defined:

```
<script type="text/javascript">
  window.SAILS_LOCALS = {
    _csrf: (function (escapedValue){
      var unescaped = escapedValue;
      // Unescape all strings in `escapedValue`.
      // (recursively parse escapedValue if it is an array or dictionary)
      // (also need to prevent endless circular recursion for circular objects)
      return unescaped;
    })('d8a831-d8a8381h1-adgadga3'),

    me: undefined
  };
</script>
```
