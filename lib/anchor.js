// anchor.js
// --------------------
// The purpose of anchor.js is to validate any sort of request parameters against what your controller is expecting
// By default, if a model exists for a controller, anchor validators are automatically generated based on model validation

// TODO: research optimum syntax, as well as what JugglingDB does for auth, since we'll be living abstacted from that
// Ideally, ORM Models, Anchor (request param validation), and Mast.Model should all share the same validation and type scheme
/*
i.e.
{
	'*': {},
	
	settings: {
		"*": { 
			"*": {
				id: INT,
				name: STRING 
			}
	
		}
	},
	
	admin: {
		create: {
			name: {
				type: STRING,
				validate: {
					len: {
						args: [3,25],
						msg: "Username must be between 3 and 25 characters."
					}
				}
			}
		}
	}
	
}
*/