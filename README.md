Sails Framework
--

Sails is like Rails, but for Node.js.

But Sails does some things that Rails doesn't do:

<dl>

<dt>New-Age Content Negotiation</dt>
<dd>a modern web framework should normalize parameters across traditional URL notation, XML, JSON, AND websockets.  Rails/grails/etc. don't do this because they were never built with websockets/realtime in mind.</dd>

<dt>Built-In Parameter Validation</dt>
<dd>Along the same vein, why is it that MVC frameworks have built in authentication for models, but not for route parameters?  It should be simple to assign validation rules to your actions and not have to check whether the parameters are valid over and over again in each one. This creates duplicative code and makes it easy to make mistakes.</dd>

<dt>Mind-bendingly Simple Authentication Middleware</dt>
<dd>
<p>Full, granular authentication control should come baked in to the framework, and the simplest possible implementation should be visible and modifiable as part of the application by default.  In your controller code, you should be able to assume that all authentication has been taken care of by your own custom and the framework's built-in middleware.  Authentication and route control logic should all be extrapolated from your controller code.</p>
<p>The access control list paradigm is great, but dealing with AROs and ACOs is confusing for programmers new to web applications.  Sails introduces a concept of "Accounts" and "Permissions" which are automatically built from a simple JSON configuration file.  This allows you to create static "Roles" which you use strictly for the purpose of making your code more readable.</p></dd>
