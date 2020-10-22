# Uploading to Amazon S3

> Please note that your Amazon S3 bucket must be created in the 'US East (N. Virginia)' region.
> If you fail to do so, the uploads will not work and you'll see an 'InvalidRequest' error from AWS.

With Sails, you can stream file uploads to Amazon S3 with very little additional configuration.


First install the [S3 Skipper adapter](https://github.com/balderdashy/skipper-s3):
```sh
npm install skipper-s3 --save
```

Then use it in one of your controllers:

```javascript
  uploadFile: function (req, res) {
    req.file('avatar').upload({
      adapter: require('skipper-s3'),
      key: 'S3 Key',
      secret: 'S3 Secret',
      bucket: 'Bucket Name'
    }, function (err, filesUploaded) {
      if (err) return res.serverError(err);
      return res.ok({
        files: filesUploaded,
        textParams: req.allParams()
      });
    });
  }
```

<docmeta name="displayName" value="Uploading to S3">
