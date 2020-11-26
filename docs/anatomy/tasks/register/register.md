# tasks/register/

This folder contains the Grunt tasks that Sails runs by default.

For more information, see [Assets > Task Automation > Task Triggers](https://sailsjs.com/documentation/concepts/assets/task-automation#?task-triggers).

> To run a custom task list, create a file in this directory and set [`sails.config.environment`](https://sailsjs.com/documentation/reference/configuration/sails-config#?sailsconfigenvironment) to match this file name.  For example, if the Sails `environment` config is set to "qa", then when you lift, instead of `tasks/register/default.js` or `tasks/register/prod.js`, Sails will _instead_ run `tasks/register/qa.js`. (If it does not exist, then `default.js` will be run instead.)

<docmeta name="displayName" value="register">

