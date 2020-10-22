# sails.renderView()

> ##### _**This feature is still experimental.**_
> This method is still under development, and its interface and/or behavior could change at any time.

Compile a view into an HTML template.

```usage
sails.renderView(pathToView, templateData);
```

### Usage

| &nbsp; |       Argument        | Type                | Details
|---|--------------------------- | ------------------- |:-----------
| 1 |      pathToView            | ((string))          | The path to the view that will be compiled into HTML.
| 2 |     _templateData_         | ((dictionary?))     | The dynamic data to pass into the view.


### Example

To compile an HTML template with a customized greeting for the recipient:

```javascript
var htmlEmailContents = await sails.renderView('emails/signup-welcome', {
  fullName: inputs.fullName,
  // Don't include the Sails app's default layout in the rendered template.
  layout: false
});
```

<docmeta name="displayName" value="sails.renderView()">
<docmeta name="pageType" value="method">
<docmeta name="isExperimental" value="true">
