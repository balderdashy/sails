# Access control and permissions

Policies in Sails are designed for controlling binary ("yes or no") access to particular actions.  They work great for checking whether a user is logged in or for other simple "yes or no" checks, like whether the logged in user is a "super admin".

To see an example of access control in action&mdash;as well as login, authentication, and password recovery&mdash;generate the starter web app:

```bash
sails new foo

# Then choose "Web App"
```

### Dynamic permissions

For more complex permission schemes, like those in which a requesting user agent's access rights depend on both _who they are_ and _what they're trying to do_, you'll want to involve the database.  While you can use policies to accomplish this, it's usually more straightforward and maintainable to use a [helper](https://sailsjs.com/documentation/concepts/helpers).

For example, you might create `api/helpers/check-permissions.js`:

```javascript
module.exports = {


  friendlyName: 'Check permissions',


  description: 'Look up a user\'s "rights" within a particular organization.',


  inputs: {
    userId: { type: 'number', required: true },
    orgId: { type: 'number', required: true }
  },

  exits: {
    success: {
      outputFriendlyName: 'Rights',
      outputDescription: `A user's "rights" within an org.`,
      outputType: ['string']
    },
    orgNotFound: {
      description: 'No such organization exists.'
    }
  },

  fn: async function(inputs, exits) {
    var org = await Organization.findOne(inputs.orgId)
    .populate('adminUsers', { id: inputs.userId })
    .populate('regularUsers', { id: inputs.userId });

    if (!org) { throw 'orgNotFound'; }

    var rights = [];
    if (org.regularUsers.length !== 0) {
      rights = ['basicAccess', 'inviteRegularUsers'];
    } else if (org.adminUsers.length !== 0) {
      rights = ['basicAccess', 'inviteRegularUsers', 'removeRegularUsers', 'inviteOrgAdmins'];
    } else if (org.owner === inputs.userId) {
      rights = ['basicAccess', 'inviteRegularUsers', 'removeRegularUsers', 'inviteOrgAdmins', 'removeOrDemoteOrgAdmins'];
    }
    // ^^This could be as simple or as granular as you need, e.g.
    // ['basicAccess', 'inviteRegularUsers', 'inviteOrgAdmins', 'removeRegularUsers', 'removeOrDemoteOrgAdmins']

    return exits.success(rights);
  }

};
```


Your action&mdash;`api/controllers/demote-org-admin.js`, for example&mdash;might look like this:

```javascript
//…
var rights = await checkPermissions(this.req.session.userId, inputs.orgId)
.intercept('orgNotFound', 'notFound');

if (!_.contains(rights, 'removeOrDemoteOrgAdmins')) {
  throw 'forbidden';
}

await Organization.removeFromCollection(inputs.orgId, 'adminUsers', inputs.targetUserId);
await Organization.addToCollection(inputs.orgId, 'regularUsers', inputs.targetUserId);

return exits.success();
```


> ### Note
> Remember that, while we used `checkPermissions(…,…)` here, we could have
> also used `.with()` and switched to named parameters:
>
> ```js
> await checkPermissions.with({
>   userId: this.req.session.userId,
>   orgId: inputs.orgId
> });
> ```
>
> You may choose to use different ways of calling a helper in order to enhance code readability in different situations.        When in doubt, a good best practice is to optimize first for explicitness, then for readability, and last for conciseness.  Still, these priorities may shift as you implement a helper more frequently and become more familiar with its usage.


<docmeta name="displayName" value="Access Control and Permissions">
