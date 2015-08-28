function MyClass() {
	this.foo = "Bar";
}

MyClass.prototype = Object.create({
	getFoo: function() {
		return this.foo;
	}
});

module.exports = {
	noBind: true,
	foo: 'bar',
	setValue: function(val) {
		this.val = val;
	},
	getValue: function() {
		return this.val;
	},
	getContext: function() {
		return this;
	},
	MyClass: MyClass,
	Error: Error
};
