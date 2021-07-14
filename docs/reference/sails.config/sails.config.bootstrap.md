# `sails.config.bootstrap`

### What is this?
`sails.config.bootstrap` is a customizable seed function that runs before your Sails app is lifted (i.e. starts up).

By convention, this function is used for:
  + setting up baseline data
    + _e.g. find or create an admin user_
  + running sanity checks on the status of your database
    + _e.g. count hand records that don't have any fingers. If any are found, then refuse to lift until the database is fixed_
  + seeding your database with stub data
    + _e.g. create & associate a few fake "Clinic", "Pet", and "Veterinarian" records to make it easier to test your animal adoption app_

For an example bootstrap function, generate a new Sails app and have a look at [`config/bootstrap.js`](https://sailsjs.com/documentation/anatomy/config/bootstrap.js).

### Notes

> - Sails will log a warning if the bootstrap function is "taking too long".  If your bootstrap function is taking longer to run than the default timeout of 30 seconds and you would like to prevent the warning from being displayed, you can stall it by configuring `sails.config.bootstrapTimeout` to a larger number of milliseconds. (For example, you can increase the timeout to one minute by using `60000`.)

<docmeta name="displayName" value="sails.config.bootstrap()">
<docmeta name="pageType" value="property">
