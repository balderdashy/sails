## Sails Generators

Generators are designed to make it easier to customize the `sails new` and `sails generate` command-line tools, and provide better for support for different Gruntfiles, configuration options, view engines, coffeescript, etc.


#### Structure

A generator has either:

(1) a `generate` method, or

(2) a `configure` + `render` method  (render may be omitted in the simplest of cases)



<!--



Sails 

```
	app (appPath + name)
		<- view
		<- folder
		<- jsonfile
		<- file

	api (appPath + name)
		<- controller
		<- model

	controller (appPath + template + name)
		<- file

	model (appPath + template + name)
		<- file

	view (appPath + template + name)
		<- file

	file (destination + name + template + data)

	jsonfile (destination + name + data)
	
	folder (destination + name)
```

-->
