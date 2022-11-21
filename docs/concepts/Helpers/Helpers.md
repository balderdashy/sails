# Helpers

As of v1.0, all Sails apps come with built-in support for **helpers**, simple utilities that let you share Node.js code in more than one place.  This helps you avoid repeating yourself, and makes development more efficient by reducing bugs and minimizing rewrites.  Like actions2, this also makes it much easier to create documentation for your app.

### Overview

In Sails, helpers are the recommended approach for pulling repeated code into a separate file, then reusing that code in various [actions](https://sailsjs.com/documentation/concepts/actions-and-controllers), [custom responses](https://sailsjs.com/documentation/concepts/extending-sails/custom-responses), [command-line scripts](https://www.npmjs.com/package/machine-as-script), [unit tests](https://sailsjs.com/documentation/concepts/testing), or even other helpers. You don't _have_ to use helpers&mdash;in fact you might not even need them right away.  But as your code base grows, helpers will become more and more important for your app's maintainability (plus, they're really convenient).

For example, in the course of creating the actions that your Node.js/Sails app uses to respond to client requests, you will sometimes find yourself repeating code in several places.  That can be pretty bug-prone, of course, not to mention annoying.  Fortunately, there's a neat solution: replace the duplicate code with a call to a custom helper:

```javascript
const greeting = await sails.helpers.formatWelcomeMessage('Bubba');
sails.log(greeting);
// => "Hello, Bubba!"
```

> Helpers can be called from almost anywhere in your code, as long as that place has access to the [`sails` app instance](https://sailsjs.com/documentation/reference/application).


### How helpers are defined

Here's an example of a simple, well-defined helper:

```javascript
// api/helpers/format-welcome-message.js
module.exports = {

  friendlyName: 'Format welcome message',


  description: 'Return a personalized greeting based on the provided name.',


  inputs: {

    name: {
      type: 'string',
      example: 'Ami',
      description: 'The name of the person to greet.',
      required: true
    }

  },


  fn: async function (inputs, exits) {
    const result = `Hello, ${inputs.name}!`;
    return exits.success(result);
  }

};
```

Though simple, this file displays several characteristics of a good helper: it starts with a friendly name and description that make it immediately clear what the utility does, it describes its inputs so that it&rsquo;s easy to see how the utility is used, and it accomplishes a discrete task in the simplest way possible.

> Look familiar?  Helpers follow the same specification as [shell scripts](https://sailsjs.com/documentation/concepts/shell-scripts) and [actions2](https://sailsjs.com/documentation/concepts/actions-and-controllers#?actions-2).

##### The `fn` function

The core of the helper is the `fn` function, which contains the actual code that the helper will run.  The function takes two arguments: `inputs` (a dictionary of input values, or "argins") and `exits` (a dictionary of callback functions).  The job of `fn` is to utilize and process the argins, and then trigger one of the provided exits to return control back to whatever code called the helper.  Note that, as opposed to a typical JavaScript function that uses `return` to provide output to the caller, helpers provide that result value by passing it in to `exits.success()`.

##### Inputs

A helper&rsquo;s declared _inputs_ are analogous to the parameters of a typical JavaScript function: they define the values that the code has to work with.  However, unlike standard JavaScript function parameters, inputs are validated automatically.  If a helper is called using argins of the wrong type for their corresponding inputs or missing a value for a required input, it will trigger an error.  Thus, helpers are _self-validating_.

Input for a helper are defined in the `inputs` dictionary.  Each input definition is composed of, at minimum, a `type` property.  Helper inputs support types like:

* `string` - a string value
* `number` - a number value (both integers and floats are valid)
* `boolean` - the value `true` or `false`
* `ref` - a JavaScript variable reference (can be _any_ value, including dictionaries, arrays, functions, streams, etc.)

These are the same data types (and related semantics) that you might already be accustomed to from [defining model attributes](https://sailsjs.com/documentation/concepts/models-and-orm/attributes).
So, as you might expect, you can provide a default value for an input by setting its `defaultsTo` property.  Or you can make it required by setting `required: true`.  You can even use `allowNull` and almost any of the higher-level validation rules like `isEmail`.


The arguments you pass in when calling a helper correspond with the order of keys in that helper's declared `inputs`.  Alternatively, if you'd rather pass in argins by name, use `.with()`:

```javascript
const greeting = await sails.helpers.formatWelcomeMessage.with({ name: 'Bubba' });
```

##### Exits

Exits describe all the different possible outcomes a helper can have, good or bad.  Every helper automatically supports the `error` and `success` exits.
When calling a helper, if its `fn` triggers `success`, then it will return normally.  But if its `fn` triggers some exit _other than_ `success`, then it will throw an Error (unless [`.tolerate()`](https://sailsjs.com/documentation/reference/waterline-orm/queries/tolerate) was used).

When necessary, you can also expose other custom exits (known as "exceptions"), allowing the userland code that calls your helper to handle specific, exceptional cases.
This helps guarantee your code&rsquo;s transparency and maintainability by making it painless and easy to declare and negotiate errors.

> Exceptions (custom exits) for a helper are defined in the `exits` dictionary.  It is a good practice to provide all custom exceptions with an explicit `description` property.


Imagine a helper called &ldquo;inviteNewUser&rdquo; which exposes a custom `emailAddressInUse` exit.  The helper's `fn` might trigger this custom exit if the provided email already exists, allowing your userland code to handle this specific scenario-- without muddying up your result values or resorting to extra `try/catch` blocks.

For example, if this helper was called from within an action that has its own "badRequest" exit:

```javascript
const newUserId = sails.helpers.inviteNewUser('bubba@hawtmail.com')
.intercept('emailAddressInUse', 'badRequest');
```

> The fancy-looking shorthand above is just a quicker way to write:
>
> ```javascript
> .intercept('emailAddressInUse', (err)=>{
>   return 'badRequest';
> });
> ```
>
> As for [.intercept()](https://sailsjs.com/documentation/reference/waterline-orm/queries/intercept),  it's just another shortcut so you're not forced to write custom try/catch blocks to negotiate these errors by hand all the time.

Internally, your helper's `fn` is responsible for triggering one of its exits, either by throwing a [special exit signal](https://sailsjs.com/documentation/concepts/actions-and-controllers#?exit-signals) or by invoking an exit callback (e.g. `exits.success('foo')`).  If your helper sends back a result through the success exit (e.g. `'foo'`), then that will be the return value of the helper.

> Note: For non-success exits, Sails will use the exit's predefined description to create an appropriate JavaScript Error instance automatically, if needed.

##### Synchronous helpers

By default, all helpers are considered _asynchronous_.  While this is a safe default assumption, it's not always true. When you know for certain that your helper is _synchronous_, you can optimize performance by telling Sails using the `sync: true` property. This allows userland code to [call the helper without `await`](https://sailsjs.com/documentation/concepts/helpers#?synchronous-usage). But if you set `sync` to `true`, don't forget to change `fn: async function` to `fn: function`!

> Note: Calling an asynchronous helper without `await` _will not work_.


##### Accessing `req` in a helper

If you&rsquo;re designing a helper that parses request headers specifically for use from within actions, then you'll want to take advantage of pre-existing methods and/or properties of the [request object](https://sailsjs.com/documentation/reference/request-req).  The simplest way to allow the code in your action to pass along `req` to your helper is to define a `type: 'ref'` input:

```javascript
inputs: {

  req: {
    type: 'ref',
    description: 'The current incoming request (req).',
    required: true
  }

}
```


Then, to use your helper in your actions, you might write code like this:

```javascript
const headers = await sails.helpers.parseMyHeaders(req);
```

### Generating a helper

Sails provides a built-in generator that you can use to create a new helper automatically:

```bash
sails generate helper foo-bar
```

This will create a file `api/helpers/foo-bar.js` that can be accessed in your code as `sails.helpers.fooBar`.  The file that is initially created will be a generic helper with no inputs and just the default exits (`success` and `error`), which immediately triggers its `success` exit when executed.

### Calling a helper

Whenever a Sails app loads, it finds all of the files in `api/helpers/`, compiles them into functions, and stores them in the `sails.helpers` dictionary using the camel-cased version of the filename.  Any helper can then be invoked from your code, simply by calling it with `await`, and providing some argin values:

```javascript
const result = await sails.helpers.formatWelcomeMessage('Dolly');
sails.log('Ok it worked!  The result is:', result);
```

> This is roughly the same usage you might already be familiar with from [model methods](sailsjs.com/documentation/concepts/models-and-orm/models) like `.create()`.

##### Synchronous usage

If a helper declares the `sync` property, you can also call it without `await`:

```javascript
const greeting = sails.helpers.formatWelcomeMessage('Timothy');
```

But before you remove `await`, make sure the helper is actually synchronous. Without `await` an asynchronous helper will never execute!

##### Organizing helpers
If your application uses many helpers, you might find it helpful to group related helpers into subdirectories. For example, imagine you had a number of `user` helpers and several `item` helpers, organized in the following directory structure

```
api/
 helpers/
  user/
   find-by-username.js
   toggle-admin-role.js
   validate-username.js
  item/
   set-price.js
   apply-coupon.js
```
When calling these helpers, each subfolder name (e.g. `user` and `item`) becomes an additional property layer in the `sails.helpers` object, so you can call `find-by-username.js` using `sails.helpers.user.findByUsername()` and you can call `set-price.js` with `sails.helpers.item.setPrice()`.

> For more information, you can read a [conversation between Ryan Emberling and Mike McNeil](https://www.linkedin.com/feed/update/urn:li:activity:6998946887701565440?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A6998946887701565440%2C7000154787505668096%29) which goes into more detail about this use case, including some general tips and tricks for working with custom helpers and organics.

### Handling exceptions

For more granular error handling (and even for those exceptional cases that aren't _quite_ errors) you may be used to setting some kind of error code, then sniffing out the error.  This approach works fine, but it can be time-consuming and hard to track.

Fortunately, there are a few different ways to conveniently handle errors in Sails helpers.  See the pages on [.tolerate()](https://sailsjs.com/documentation/reference/waterline-orm/queries/tolerate), [.intercept()](https://sailsjs.com/documentation/reference/waterline-orm/queries/intercept), and [special exit signals](https://sailsjs.com/documentation/concepts/actions-and-controllers#?exit-signals) for more information.


<!--
For future reference, see https://github.com/balderdashy/sails-docs/commit/61f0039d26021c8abf4873aa675c409372dc2f8f
for the original content of these docs.
-->

##### As much or as little as you need

While the usage in this example is excessive, it's easy to imagine a scenario in which it would be helpful to rely on custom exits like `notUnique`.  Still, you don't want to have to handle _every_ custom exit _every_ time.  Ideally, you'd only have to handle a custom exit in your userland code when necessary: whether to implement a feature of some kind or even to improve user experience or provide a better internal error message.

Luckily, Sails helpers support "automatic exit forwarding".  That means userland code can choose to integrate with _as few or as many custom exits as you like_, on a case by case basis.  In other words, when calling a helper it's OK to completely ignore its custom `notUnique` exit if you don't need it.  That way, your code remains as concise and intuitive as possible.  And if things change, you can always revise your code to handle the custom exit later.

### Next steps

+ [Explore a practical example](https://sailsjs.com/documentation/concepts/helpers/example-helper) of a helper in a Node.js/Sails app.
+ `sails-hook-organics` (which is bundled in the "Web App" template) comes with several free, open-source, and MIT-licensed helpers for many common use cases.  [Have a look!](https://npmjs.com/package/sails-hook-organics)
+ [Click here](https://sailsjs.com/support) if you're unsure about helpers, or if you want to see more tutorials and examples.

<docmeta name="displayName" value="Helpers">
<docmeta name="nextUpLink" value="/documentation/concepts/deployment">
<docmeta name="nextUpName" value="Deployment">
