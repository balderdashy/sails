# Custom configuration

### What is this?

The custom configuration for your app. This is useful for one-off settings specific to your application, like the domain to use when sending emails, or third-party API keys for Stripe, Mailgun, Twitter, Facebook, etc.

These values are usually set in the [`config/custom.js`](https://sailsjs.com/documentation/anatomy/config/custom-js) file and may be overridden in production using `config/env/production.js`, environment variables, or any  of the other [configuration mechanisms](https://sailsjs.com/documentation/concepts/configuration) provided by Sails.

### Example

First, to set custom configuration:

```javascript
// config/custom.js
module.exports.custom = {
  mailgunDomain: 'transactional-mail.example.com',
  mailgunApiKey: 'key-testkeyb183848139913858e8abd9a3'
};
```

Then, to access these values from your actions and helpers, use `sails.config.custom`:

```javascript
sails.config.custom.mailgunApiKey;
// -> "key-testkeyb183848139913858e8abd9a3"
```


<docmeta name="displayName" value="sails.config.custom">
