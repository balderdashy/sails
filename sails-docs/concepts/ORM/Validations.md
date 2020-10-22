# Validations

Sails bundles support for automatic validations of your models' attributes. Any time a record is updated, or a new record is created, the data for each attribute will be checked against all of your predefined validation rules. This provides a convenient failsafe to ensure that invalid entries don't make their way into your app's database(s).

Except for `unique` (which is implemented as a database-level constraint; [see "Unique"](https://sailsjs.com/documentation/concepts/models-and-orm/validations#?unique)), all validations below are implemented in JavaScript and run in the same Node.js server process as Sails.  Also keep in mind that, no matter what validations are used, an attribute must _always_ specify one of the built-in data types (`string`, `number`, `json`, etc).

```javascript
// User
module.exports = {
  attributes: {
    emailAddress: {
      type: 'string',
      unique: true,
      required: true
    }
  }
};
```

### Built-in data types

In Sails/Waterline, model attributes always have some kind of data type guarantee.  This is above and beyond any physical-layer constraints which might exist in your underlying database&mdash;it's more about providing a way for developers to maintain reasonable assumptions about the data that goes in or comes out of a particular model.

This data type guarantee is used for logical validation and coercion of results and criteria.  Here is a list of the data types supported by Sails and Waterline:

| Data Type        | Usage                         | Description                                                  |
|:----------------:|:----------------------------- |:------------------------------------------------------------ |
| ((string))       | `type: 'string'`              | Any string.
| ((number))       | `type: 'number'`              | Any number.
| ((boolean))      | `type: 'boolean'`             | `true` or `false`.
| ((json))         | `type: 'json'`                | Any JSON-serializable value, including numbers, booleans, strings, arrays, dictionaries (plain JavaScript objects), and `null`.
| ((ref))          | `type: 'ref'`                 | Any JavaScript value except `undefined`. (Should only be used when taking advantage of adapter-specific behavior.)    |

Sails' ORM (Waterline) and its adapters perform loose validation to ensure that the values provided in criteria dictionaries and as values to `.create()` or `.update()` match the expected data type.

**NOTE:** In adapters that don't support the ((json)) type natively, the adapter must support it in other ways. For example, in MySQL the data being written to a ((json)) attribute gets `JSON.stringify()` called on it and then is stored in a column with a type set to `text`. Each time the record is returned, the data has `JSON.parse()` called on it. This is something to be aware of when considering performance and compatibility with other applications or existing data in the database. The official PostgreSQL and mongoDB adapters can read and write ((json)) data natively.


##### Null and empty string

The `string`, `number` and `boolean` data types do _not_ accept `null` as a value when creating or updating records.  In order to allow a `null` value to be set, toggle the `allowNull` flag on the attribute. The `allowNull` flag is only valid on the above data types; it is _not_ valid on attributes with types `json` or `ref`, any associations, or any primary key attributes.

Since empty string ("") is a string, it is normally supported by `type: 'string'` attributes; but there are a couple of exceptions:  primary keys (because primary keys never support empty string) and any attribute which has `required: true`.


##### Required

If an attribute is `required: true`, then a value must always be specified for it when calling `.create()`.  This also prevents a value from being set to `null` or empty string ("") when created or updated.

### Validation rules

_None_ of the following validation rules impose any additional restrictions against `null`.  That is, if `null` would be allowed normally, then enabling the `isEmail` validation rule will not cause `null` to be rejected as invalid.

Similarly, _most_ of the following validation rules don't impose any additional restrictions against empty string ("").  There are a few exceptions (`isNotEmptyString` and non-string-related rules like `isBoolean`, `isNumber`, `max`, and `min`), but otherwise, for any attribute where empty string ("") would normally be allowed, adding a validation rule will not cause it to be rejected.

In the table below, the "Compatible Attribute Type(s)" column shows what data type(s) (i.e. for the attribute definition's `type` property) are appropriate for each validation rule.  In many cases, a validation rule can be used with more than one type.  Note that the table below takes a shortcut:  if compatible with ((string)), ((number)), or ((boolean)), then the validation rule is also compatible with ((json)) and ((ref)), even if it doesn't explicitly say so.


| Name of Rule      | What It Checks For                                                                                                  | Notes On Usage                                         | Compatible Attribute Type(s) |
|:------------------|:--------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------|:----------------------------:|
| custom            | A value such that when it is provided as the first argument to the custom function, the function returns `true`.                          | [Example](https://sailsjs.com/documentation/concepts/models-and-orm/validations#?custom-validation-rules)            |  _Any_   |
| isAfter           | A value that, when parsed as a date, refers to a moment _after_ the configured JavaScript `Date` instance.          | `isAfter: new Date('Sat Nov 05 1605 00:00:00 GMT-0000')`  | ((string)), ((number))       |
| isBefore          | A value that, when parsed as a date, refers to a moment _before_ the configured JavaScript `Date` instance.         | `isBefore: new Date('Sat Nov 05 1605 00:00:00 GMT-0000')` | ((string)), ((number))       |
| isBoolean         | A value that is `true` or `false` | isBoolean: true | ((json)), ((ref)) |
| isCreditCard      | A value that is a credit card number.                                                                               | **Do not store credit card numbers in your database unless your app is PCI compliant!**  If you want to allow users to store credit card information, a safe alternative is to use a payment API like [Stripe](https://stripe.com). | ((string)) |
| isEmail           | A value that looks like an email address.                                                                           | `isEmail: true`                                         | ((string)) |
| isHexColor        | A string that is a hexadecimal color.                                                                               | `isHexColor: true`                                      | ((string)) |
| isIn              | A value that is in the specified array of allowed strings.                                                          | `isIn: ['paid', 'delinquent']`                          | ((string)) |
| isInteger         | A number that is an integer (a whole number)                                                                        | `isInteger: true`                                       | ((number)) |
| isIP              | A value that is a valid IP address (v4 or v6)                                                                       | `isIP: true`                                              | ((string)) |
| isNotEmptyString  | A value that is _not_ an empty string | `isNotEmptyString: true` | ((json)), ((ref))
| isNotIn           | A value that **is not in** the configured array.                                                                    | `isNotIn: ['profanity1', 'profanity2']`                   | ((string)) |
| isNumber          | A value that is a Javascript number | `isNumber: true` | ((json)), ((ref))
| isString          | A value that is a string (i.e. `typeof(value) === 'string'`) | `isString: true` | ((json)), ((ref))
| isURL             | A value that looks like a URL. | `isURL: true` | ((string)) |
| isUUID            | A value that looks like a UUID (v3, v4 or v5) | `isUUID: true` | ((string))
| max               | A number that is less than or equal to the configured number. | `max: 10000` | ((number)) |
| min               | A number that is greater than or equal to the configured number. | `min: 0` | ((number)) |
| maxLength         | A string that has no more than the configured number of characters. |  `maxLength: 144` | ((string)) |
| minLength         | A string that has at least the configured number of characters. | `minLength: 8` | ((string)) |
| regex             | A string that matches the configured regular expression. | `regex: /^[a-z0-9]$/i` | ((string)) |


##### Example: optional email address

Imagine that you have an attribute defined as follows:

```javascript
workEmail: {
  type: 'string',
  isEmail: true,
}
```

When you call `.create()` _or_ `.update()`, this value can be set to any valid email address (like "santa@clause.com") OR to an empty string ("").  You would _not_ be able to set it to `null`, though, because that would violate the type safety restriction imposed by `type: 'string'`.

> To make this attribute accept `null` (e.g. if you are working with a pre-existing database), change it to `type: 'json'`.  You'd normally also want to add `isString: true`, but since we already enforce `isEmail: true` in this example, there's no need to do so.
>
> A more advanced feature to keep in mind is that, depending on your database, you can choose to take advantage of [`columnType`](https://sailsjs.com/documentation/concepts/models-and-orm/attributes#?columntype) to inform Sails / Waterline which column type to define during auto-migrations (if relevant).


##### Example: required star rating

If we want to indicate that an attribute supports certain numbers, like a star rating, we might do something like this:

```javascript
starRating: {
  type: 'number',
  min: 1,
  max: 5,
  required: true,
}
```


##### Example: optional star rating

If we want to make our star rating optional, it's easiest to just remove the `required: true` flag.  If omitted, the starRating will default to zero.


##### Example: optional star rating (with `null`)

But what if the star rating can't _always_ be a number? Imagine we need to integrate with a legacy database in which star ratings could be either a number or the special null literal. In this scenario, we would like to define the `starRating` attribute to support both certain numbers and `null`.

To accomplish this, just use `allowNull`:

```javascript
starRating: {
  type: 'number',
  allowNull: true,
  min: 1,
  max: 5,
}
```

> Sails and Waterline attributes support `allowNull` for convenience, but another viable solution is to change `starRating` from `type: 'number'` to `type: 'json'`.  Remember, though, that the `json` type allows other data, like booleans, arrays, etc. If we want to explicitly protect against those data types being supported by `starRating`, we could add the `isNumber: true` validation rule:
>
>
> ```javascript
> starRating: {
>   type: 'json',
>   isNumber: true,
>   min: 1,
>   max: 5,
> }
> ```



### Unique

`unique` is different from all of the validation rules listed above.  In fact, it isn't really a validation rule at all: it is a **database-level constraint**.  More on that in a second.

If an attribute declares itself `unique: true`, then Sails ensures that no two records will be allowed with the same value.  The canonical example is an `emailAddress` attribute on a `User` model:

```javascript
// api/models/User.js
module.exports = {

  attributes: {
    emailAddress: {
      type: 'string',
      unique: true,
      required: true
    }
  }

};
```

##### Why is `unique` different from other validations?

Imagine you have 1,000,000 user records in your database.  If `unique` was implemented like other validations, every time a new user signed up for your app, Sails would need to search through _one million_ existing records to ensure that no one else was already using the email address provided by the new user.  That would be so slow that by the time we finished searching through all those records, someone else could have signed up!

Fortunately, this type of uniqueness check is perhaps the most universal feature of _any_ database.  To take advantage of that, Sails relies on the [database adapter](https://sailsjs.com/documentation/concepts/models-and-orm#?adapters) to implement support for `unique`&mdash;specifically, it adds a **uniqueness constraint** to the relevant field/column/attribute in the database itself during [auto-migration](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?migrate).  That is, while your app is set to `migrate:'alter'`, Sails will automatically generate tables/collections in the underlying database with uniqueness constraints built right in.  Once you switch to `migrate:'safe'`, updating your database constraints is up to you.

##### What about indexes?

When you start using your production database, it is always a good idea to set up indexes to boost your database's performance.  The exact process and best practices for setting up indexes varies between databases and is beyond the scope of this documentation.  That said, if you've never done this before, don't worry: it's [easier than you think](http://stackoverflow.com/a/1130/486547).

Just like everything else related to your production schema, once you set your app to use `migrate: 'safe'`, Sails leaves database indexes entirely up to you.

> Note that this means you should be sure to update your indexes alongside your uniqueness constraints when performing [manual migrations](https://github.com/BlueHotDog/sails-migrations).


### When to use validations

Validations can save you from writing many hundreds of lines of repetitive code,  but keep in mind that model validations are run for _every create or update_ in your application.  Before using a validation rule in one of your attribute definitions, make sure you are okay with it being applied _every time_ your application calls `.create()` or `.update()` to specify a new value for that attribute.  If that is _not_ the case, write code that validates the incoming values inline in your controller, or call a custom function in one of your [services](https://sailsjs.com/documentation/concepts/services) or a [model class method](https://sailsjs.com/documentation/concepts/models-and-orm/models#?model-methods-aka-static-or-class-methods).

Suppose that your Sails app allows users to sign up for an account by either (A) entering an email address and password and then confirming that email address or (B) signing up with LinkedIn.  Your `User` model might have one attribute called `manuallyEnteredEmail` and another called `linkedInEmail`.  While one of those email address attributes is required, _which_ one that is depends on how a user signs up.  In this case, your `User` model cannot use the `required: true` validation. In order to confirm that one of the two emails has been provided&mdash;and that the provided email is valid&mdash;you'll instead have to manually check these values before the relevant `.create()` and `.update()` calls in your code:

```javascript
if ( !_.isString( req.param('email') ) ) {
  return res.badRequest();
}
```

Taking this one step further, let's say your application accepts payments.  During the sign-up flow, if the user signs up with a paid plan, they must provide an email address for billing purposes (`billingEmail`), while if the user signs up with a free account, they skip that step.  On the account settings page, users on the paid plan see a "Billing Email" form field where they can customize their billing email. Users with the free plan, on the other hand, see a call to action which links to the "Upgrade Plan" page.

While these requirements seem specific, there are still unanswered questions:

- Do we update the billing email automatically when the other email address from which it was defaulted changes?
- What if the billing email had been changed at least once?
- What happens to the billing email after a user downgrades to the free plan? If that user upgrades to a paid plan again, do we request their billing email address anew or use the old one?
- What happens to the billing email when an existing user connects their LinkedIn account and a new `linkedInEmail` is saved?
- What happens to the billing email if a monthly invoice email cannot be delivered?
- What happens to the billing email if a member of your support team logs into the admin interface and changes it manually?
- What happens to the billing email if a POST request is received on the callback URL we provided to the LinkedIn API to notify our app that the user changed their email address on http://linkedin.com, saving a new `linkedInEmail`?
- What happens to the billing email when an existing user disconnects their LinkedIn account?
- Are two user accounts in the database allowed to have the same billing email?  What about the email from LinkedIn?  Or the one they entered manually?

Depending on the answers to questions like these, we might end up keeping the `required` validation on `billingEmail`, adding new attributes (like `hasBillingEmailBeenChangedManually`), or even rethinking whether we use a `unique` constraint.

### Best practices

Finally, here are a few tips:

+ Your initial decision about whether or not to use validations for a particular attribute should depend on your app's requirements and how you are calling `.update()` and `.create()`. Don't be afraid to forgo built-in validation support in favor of checking values by hand in your controllers or in a helper function.  Oftentimes this is the cleanest and most maintainable approach.
+ There's nothing wrong with adding or removing validations from your models as your app evolves, but once in production, there is one **very important exception**: `unique`.  During development, when your app is configured to use [`migrate: 'alter'`](https://sailsjs.com/documentation/concepts/models-and-orm/model-settings#?migrate), you can add or remove `unique` validations at will.  However, if you are using `migrate: safe` (e.g. with your production database), you will want to update constraints/indices in your database, as well as [migrate your data by hand](https://github.com/BlueHotDog/sails-migrations).
+ It is a very good idea to take the time to fully understand your application's user interface _first_, before setting up complex validations on your model attributes.

> As much as possible, it is best to obtain or flesh out your own wireframes of your app's user interface _before_ you spend any serious amount of time implementing _any_ backend code.  Of course, this isn't always possible, and that's what the [blueprint API](https://sailsjs.com/documentation/concepts/blueprints) is for.  Applications built with a UI-centric, or "front-end first", philosophy are easier to maintain, tend to have fewer bugs, and&mdash;since mindfulness of the user experience is at their core&mdash;often have more elegant APIs.



### Custom validation rules

You can define your own custom validation rules by specifying a `custom` function in your attributes.

```javascript
// api/models/User.js
module.exports = {

  // Values passed for creates or updates of the User model must obey the following rules:
  attributes: {

    firstName: {
      // Note that a base type (in this case "string") still has to be defined, even though validation rules are in use.
      type: 'string',
      required: true,
      minLength: 5,
      maxLength: 15
    },

    location: {
      type: 'json',
      custom: function(value) {
        return _.isObject(value) &&
        _.isNumber(value.x) && _.isNumber(value.y) &&
        value.x !== Infinity && value.x !== -Infinity &&
        value.y !== Infinity && value.y !== -Infinity;
      }
    },

    password: {
      type: 'string',
      custom: function(value) {
        // • be a string
        // • be at least 6 characters long
        // • contain at least one number
        // • contain at least one letter
        return _.isString(value) && value.length >= 6 && value.match(/[a-z]/i) && value.match(/[0-9]/);
      }
    }

  }

}
```

Custom validation functions receive the incoming value to be validated as their first argument. They are expected to return `true` if valid and `false` otherwise.



##### Custom validation messages

Out of the box, Sails.js does not support custom validation messages.  Instead, your code should [look at (or "negotiate") validation errors](https://sailsjs.com/documentation/concepts/models-and-orm/errors#?usage-errors) thrown by `.create()` or `.update()` calls and take the appropriate action, whether that's sending a particular error code in your JSON response or rendering the appropriate message in an HTML error page.


<docmeta name="displayName" value="Validations">
