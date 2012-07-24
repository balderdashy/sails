mast
====

Sails&#39;-optimized web UI framework, based on Backbone.js.

Like Sails, Mast is mainly just a collection of the latest stable versions of really great libraries.  

Sails combines Backbone.js, Socket.io, and jQuery to unify the browser event model.
Events might be triggered by logic, a user DOM action, or a push from a socket connection, but before, these event systems were separate.

Mast introduces the concept of a Component, which is a minimal logical UI element which completely abstracts DOM interaction to its Pattern(s). 

Patterns consist of a backbone model and a template (loaded by selector from the DOM, as a javascript string, or by URL over AJAX).
When templates and/or models change, the Pattern fires an event which Components are wired up to listen to.
But best of all, as a Mast user, you should never have to deal with patterns.  

When you change the model, or change the template, for a component, it just works-- the DOM automatically gets updated.

Mast also enhances jQuery's DOM events by adding "pressEnter", "pressEscape", and "clickoutside"

There are a few different kinds of built in components:

Component
- may contain multiple named subomponents

Table
- extends component
- contains a list of subcomponent rows which correspond with a collection of Mast.Models


