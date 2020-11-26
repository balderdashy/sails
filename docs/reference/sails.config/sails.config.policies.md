# `sails.config.policies`
<!--
> FUTURE:
>
> Merge most of the contents of this file into the main reference section on policies.
> Include a simple config reference table (with only one row with property: `*`) explaining how
> this particular config module is read.  But don't worry about trying to explain what policies are here-- instead, link to the full docs on the subject (again, to reduce duplicate content and make this all more maintainable)
-->

This configuration is a dictionary that maps [policies](https://sailsjs.com/documentation/concepts/policies) to an app&rsquo;s [actions](https://sailsjs.com/documentation/concepts/actions-and-controllers).  See [Concepts > Policies](https://sailsjs.com/documentation/concepts/policies#?using-policies-with-blueprint-actions) for more info.

### Properties

| Property    | Type       | Default  | Details |
|:-----------|:----------:|:----------|:--------|
| (any string)  | ((string))<br/>_or_<br/>((dictionary)) | n/a | Any properties added to `sails.config.policies` will be interpreted as a mapping of policies to a controller or a set of standalone actions.

### Example

```js
module.exports.policies = {

  '*': 'isLoggedIn', // Require user to be logged in to access any action not otherwise mapped in this config
  'UserController': {
    'login': true    // Always allow access to the user login action
  }


}
```

<docmeta name="displayName" value="sails.config.policies">
<docmeta name="pageType" value="property">
