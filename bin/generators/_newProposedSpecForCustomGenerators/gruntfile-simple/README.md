
## Usage

To use generators programmatically:

```javascript
var generate = require('sails-generate');
var GeneratorDef = require('sails-generate-gruntfile-default');
generate(GeneratorDef, {
	success: function() {},
	error: function() {},
	invalid: function() {},
});
```