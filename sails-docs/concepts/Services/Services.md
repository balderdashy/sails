# Services

> _**Note**_: Although Services are still fully supported in Sails 1.0, it is recommended that you use [helpers](https://sailsjs.com/documentation/concepts/helpers) instead.

**Services** are stateless libraries of functions that you can use from anywhere in your Sails app.  For example, you might have an `EmailService` which tidily wraps up one or more utility functions so you can use them in more than one place within your application.

Another benefit of using services in Sails is that they are *globalized*, which means that you don't have to use `require()` to access them, although you can if you prefer (you can also disable the automatic exposure of global variables in your app's configuration). By default, you can access a service and call its functions (e.g. `EmailService.sendHtmlEmail()` or `EmailService.sendPasswordRecoveryEmail()`) from anywhere: within controller actions, from inside other services, in custom model methods, or even from command-line scripts.

Hypothetically, one could create a service for:

- Sending an email
- Blasting tweets to celebrities
- Retrieving data from a third party API

But [helpers](https://sailsjs.com/documentation/concepts/helpers) are a better bet.

<docmeta name="displayName" value="Services">
