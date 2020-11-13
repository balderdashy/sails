# The `config/local.js` file

The config/local.js file is useful for configuring a Sails app for your local environment (your laptop, for example). This would be a good place to store settings like database or email passwords that apply only to you, and shouldn't be shared with others in your organization.

These settings take precedence over all other files in `config/`, including those in the `env/` subfolder.
 
Note:
> By default, `config/local.js` is included in your `.gitignore`, so if you're using git as a version control solution for your Sails app, keep in mind that this file won't be committed to your repository!
>
> Good news is, that means you can specify configuration for your local machine in this file without inadvertently committing personal information (like database passwords) to the repo.  Plus, this prevents other members of your team from commiting their local configuration changes on top of yours.
>
> In a production environment, you'll probably want to leave this file out entirely and configure all of your production overrides using `env/production.js`, or environment variables, or a combination of both.

<docmeta name="displayName" value="The local.js file">
