# File uploads

Uploading files in Sails is similar to uploading files for a vanilla Node.js or Express application. However, the process may be unfamiliar if you're coming from a different server-side platform like PHP, .NET, Python, Ruby, or Java.  But fear not: the core team has gone to great lengths to make file uploads easier without sacrificing scalability or security.

Sails comes with a powerful "body parser", [Skipper](https://github.com/balderdashy/skipper), which makes it easy to implement streaming file uploads&mdash;not only to the server's filesystem (i.e. hard disk), but also to Amazon S3, MongoDB's gridfs, or any other supported file adapter.

Sails does not automatically virus scan file uploads, or do any other attempt to detect whether uploaded files might be infected, broken, or unusual.  If you allow users to upload and share files with each other, it is your responsibility to protect your users from each other.  Always assume any request coming into your server could be malicious or misrepresent itself.


### Uploading a file

Files are uploaded to HTTP web servers as _file parameters_.  In the same way that you might send a form POST to a URL with text parameters like "name", "email", and "password", you send files as file parameters like "avatar" or "newSong".

Take this simple example:

```javascript
req.file('avatar').upload(function (err, uploadedFiles) {
  // ...
});
```

Files should be uploaded inside of an [action](https://sailsjs.com/documentation/concepts/actions-and-controllers).  Below is a more in-depth example that demonstrates how you could allow users to upload an avatar image and link it to an account.  This example assumes that you've already taken care of access control in a policy, and that you're storing the id of the logged-in user in `req.session.userId`.

```javascript
// api/controllers/UserController.js
//
// ...


/**
 * Upload avatar for currently logged-in user
 *
 * (POST /user/avatar)
 */
uploadAvatar: function (req, res) {

  req.file('avatar').upload({
    // don't allow the total upload size to exceed ~10MB
    maxBytes: 10000000
  },function whenDone(err, uploadedFiles) {
    if (err) {
      return res.serverError(err);
    }

    // If no files were uploaded, respond with an error.
    if (uploadedFiles.length === 0){
      return res.badRequest('No file was uploaded');
    }

    // Get the base URL for our deployed application from our custom config
    // (e.g. this might be "http://foobar.example.com:1339" or "https://example.com")
    var baseUrl = sails.config.custom.baseUrl;

    // Save the "fd" and the url where the avatar for a user can be accessed
    User.update(req.session.userId, {

      // Generate a unique URL where the avatar can be downloaded.
      avatarUrl: require('util').format('%s/user/avatar/%s', baseUrl, req.session.userId),

      // Grab the first file and use it's `fd` (file descriptor)
      avatarFd: uploadedFiles[0].fd
    })
    .exec(function (err){
      if (err) return res.serverError(err);
      return res.ok();
    });
  });
},


/**
 * Download avatar of the user with the specified id
 *
 * (GET /user/avatar/:id)
 */
avatar: function (req, res){

  User.findOne(req.param('id')).exec(function (err, user){
    if (err) return res.serverError(err);
    if (!user) return res.notFound();

    // User has no avatar image uploaded.
    // (should have never have hit this endpoint and used the default image)
    if (!user.avatarFd) {
      return res.notFound();
    }

    var SkipperDisk = require('skipper-disk');
    var fileAdapter = SkipperDisk(/* optional opts */);

    // set the filename to the same file as the user uploaded
    res.set("Content-disposition", "attachment; filename='" + file.name + "'");

    // Stream the file down
    fileAdapter.read(user.avatarFd)
    .on('error', function (err){
      return res.serverError(err);
    })
    .pipe(res);
  });
}

//
// ...
```




#### Where do the files go?
When using the default `receiver`, file uploads go to the `myApp/.tmp/uploads/` directory.  This can be overridden using the `dirname` option.  Note that you'll need to specify this option both when you call the `.upload()` function and when you invoke the skipper-disk adapter (so that you are uploading to and downloading from the same place).

> Any Node.js app (or other server-side app) that receives untrusted file uploads and stores them on disk should never upload those files into paths within a Java server web root or any directory that a legacy web server might automatically dive into recursively to execute arbitrary code files that it finds.  For best results, upload files to S3 or a safe directory on disk.  Always assume any request coming into your server could be malicious or misrepresent itself.

#### Uploading to a custom folder
In the example above we upload the file to .tmp/uploads, but how can we configure it with a custom folder, say `assets/images`? We can achieve this by adding options to the upload function as shown below.

```javascript
req.file('avatar').upload({
  dirname: require('path').resolve(sails.config.appPath, 'assets/images')
},function (err, uploadedFiles) {
  if (err) return res.serverError(err);

  return res.json({
    message: uploadedFiles.length + ' file(s) uploaded successfully!'
  });
});
```

### Sending text parameters in the same form as a file upload

If you need to send text parameters along with your file upload, the simplest way is by including them in the URL.

If you must send text parameters in the body of your request, the easiest way to handle this is by using the built in Cloud SDK that comes with the "Web app" template. (This also makes JSON parameters sent alongside file uploads "just work" when they wouldn't without extra work.)

> As of Parasails v0.9.x, [the bundled Cloud SDK](https://github.com/mikermcneil/parasails/compare/v0.8.4...v0.9.0-4) properly handles additional parameters for you, so if you've generated your Sails app with the "Web app" template, you might want to make sure you're using the latest version of [`dist/parasails.js` and `dist/cloud.js`](https://github.com/mikermcneil/parasails/releases) in your project.

Regardless of what you're using on the client side, you'll need to do things a little differently than usual in your Sails action on the back end. Because we're dealing with a multipart upload, any text parameters in your request body _must be sent before any files_.  This allows Sails to run your action code while files are still uploading, rather than having to wait for them to finish (avoiding a [famous DDoS vulnerability in Express-based Node.js apps](https://andrewkelley.me/post/do-not-use-bodyparser-with-express-js.html)). See the [Skipper docs](https://github.com/balderdashy/skipper#text-parameters) for advanced information on how this works behind the scenes.

### Example

#### Generate an `api`
First we need to generate a new `api` for serving/storing files.  Do this using the sails command line tool.

```sh
$ sails generate api file

debug: Generated a new controller `file` at api/controllers/FileController.js!
debug: Generated a new model `File` at api/models/File.js!

info: REST API generated @ http://localhost:1337/file
info: and will be available the next time you run `sails lift`.
```

#### Write Controller Actions

Lets make an `index` action to initiate the file upload and an `upload` action to receive the file.

```javascript

// myApp/api/controllers/FileController.js

module.exports = {

  index: function (req,res){

    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
    '<form action="http://localhost:1337/file/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="avatar" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
    )
  },
  upload: function  (req, res) {
    req.file('avatar').upload(function (err, files) {
      if (err)
        return res.serverError(err);

      return res.json({
        message: files.length + ' file(s) uploaded successfully!',
        files: files
      });
    });
  }

};
```

### Notes
> While loading untrusted JavaScript as an `<img src="…">` [is not an XSS vulnerability in modern browsers](https://stackoverflow.com/a/46041031), the MIME type in the request headers of file uploads should never be relied upon.  Always assume any request coming into your server could be malicious or misrepresent itself.


## Read more

+ [Skipper docs](https://github.com/balderdashy/skipper)
+ [Uploading to Amazon S3](https://sailsjs.com/documentation/concepts/file-uploads/uploading-to-s-3)
+ [Uploading to Mongo GridFS](https://sailsjs.com/documentation/concepts/file-uploads/uploading-to-grid-fs)



<docmeta name="displayName" value="File uploads">
