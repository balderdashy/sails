# Hosting

Here is a non-comprehensive list of Node/Sails hosting providers and a few available community tutorials.  Keep in mind that, most of the time, the process for deploying your Sails app is exactly the same as it would be for any other Node.js app.  Just be sure to take a look at the [other pages](https://sailsjs.com/documentation/concepts/deployment) in this section of the docs (as well as your app's [`config/env/production.js` file](https://sailsjs.com/documentation/anatomy/config/env/production-js)) and make any necessary adjustments before you actually deploy to production.


### Heroku

<a title="Deploy your Sails/Node.js app on Heroku" href="http://heroku.com"><img style="width:285px;" src="https://sailsjs.com/images/deployment_heroku.png" alt="Heroku logo"/></a>

Heroku offers easy, free deployment for any Sails project generated using the Web App template:

1. Create a GitHub repo and push your code up to the `master` branch.
2. Create a Heroku pipeline and a staging app within that pipeline (e.g. `my-cool-site-staging`).
3. Using the point-and-click interface, set up that staging app to auto-deploy from the `deploy` branch of your GitHub repo.
4. Under "Add-ons", set up Papertrail for logging, Redis2Go as your production session store (and for delivering socket messages, if relevant), Heroku Scheduler for scheduled jobs (if relevant), and a database host of your choosing (e.g. MySQL, PostgreSQL, MongoDB).
5. Run through `config/production.js` and `config/staging.js` in your project and set it up.  Any information you feel is too sensitive to hard-code into those files (like database credentials) can be stored in Heroku's config vars (see bundled config files for examples).
6. In the terminal, make sure you've got everything pulled/pushed and are fully in sync with the remote master branch on GitHub.
7. Deploy by typing `sails run deploy`.

You can see a demonstration of this in action [here](https://courses.platzi.com/courses/sails-js/).

##### More resources for using Heroku with Node.js/Sails.js:

+ [Platzi: Full Stack JavaScript: Pt 5 (2018)](https://courses.platzi.com/courses/sails-js/)
+ [Hello Sails.js: Hosting your Sails.js application on Heroku (2016-2017)](https://hellosails.com/hosting-your-sails-js-application-heroku/)
+ [Platzi: Develop Apps with Sails.js: Pt 2 (2015)](https://courses.platzi.com/classes/develop-apps-sails-js/)  _(see part 2)_
+ [Sails.js on Heroku (2015)](http://vort3x.me/sailsjs-heroku/)
+ [SailsCasts: Deploying a Sails App to Heroku (2013)](http://irlnathan.github.io/sailscasts/blog/2013/11/05/building-a-sails-application-ep26-deploying-a-sails-app-to-heroku/)

<!--
More 2013:
+ [StackOverflow: Sails.js + Heroku (2013)](http://stackoverflow.com/a/20184907/486547)
+ https://groups.google.com/forum/#!topic/sailsjs/vgqJFr7maSY
+ https://github.com/chadn/heroku-sails
+ http://dennisrongo.com/deploying-sails-js-to-heroku
-->

### Microsoft Azure

<a title="Deploy a Sails.js web app to Azure App Service" href="https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-nodejs-sails"><img style="width:350px;" src="https://sailsjs.com/images/deployment_azure.png" alt="Azure logo"/></a>

+ [Deploy a Sails.js web app to Azure App Service (2017)](https://docs.microsoft.com/en-us/azure/app-service-web/app-service-web-nodejs-sails)

<!--
+ [Deploying Sails.js to Azure Web Apps (2015)](https://blogs.msdn.microsoft.com/partnercatalystteam/2015/07/16/y-combinator-collaboration-deploying-sailsjs-to-azure-web-apps/)
PAGE NOT FOUND
-->

### Google Cloud Platform

<a title="Deploy your Sails/Node.js app to Google Cloud Platform" href="https://cloud.google.com/nodejs/resources/frameworks/sails"><img style="width:350px;" src="https://sailsjs.com/images/deployment_googlecloud.png" alt="Google Cloud Platform logo"/></a>

Using Google Cloud Platform means that your apps run on the same infrastructure that powers all of Google's products, so you can be confident that they'll scale seamlessly&mdash;no matter how many users you have.

+ [Run Sails.js on Google Cloud Platform (2016)](https://cloud.google.com/nodejs/resources/frameworks/sails)
<!--
+ [Deploying Sails.js to Google Cloud (2016)](http://www.mot.la/2016-06-04-deploying-sails-js-to-google-cloud.html)
PAGE NOT FOUND
-->
+ [A couple of Googlers demonstrate and deploy their app built on Sails.js and GO in a talk called `runtime:yours` at Google Cloud Platform Live (2014)](https://www.facebook.com/sailsjs/posts/721341477911963)


### DigitalOcean

<a title="DigitalOcean" href="https://aws.amazon.com/"><img style="width:225px;" src="https://sailsjs.com/images/deployment_digitalocean.png" alt="DigitalOcean logo"/></a>

+ [Troubleshooting: Can't install Sails.js on DigitalOcean (2017)](https://www.digitalocean.com/community/questions/can-t-install-sails-js)
+ [How to use PM2 to set up a Node.js production environment on an Ubuntu VPS (2014)](https://www.digitalocean.com/community/articles/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps)
+ [How to create a Node.js app using Sails.js on an Ubuntu VBS (2013)](https://www.digitalocean.com/community/articles/how-to-create-an-node-js-app-using-sails-js-on-an-ubuntu-vps)

<!--
More 2013:
+ https://www.digitalocean.com/community/articles/how-to-host-multiple-node-js-applications-on-a-single-vps-with-nginx-forever-and-crontab
-->


### Amazon Web Services (AWS)

<a title="Amazon Web Services (AWS)" href="https://aws.amazon.com/"><img style="width:275px;" src="https://sailsjs.com/images/deployment_aws.png" alt="AWS logo"/></a>


+ [Creating a Sails.js application on AWS (2017)](http://bussing-dharaharsh.blogspot.com/2013/08/creating-sailsjs-application-on-aws-ami.html) _(see also [this question on ServerFault](http://serverfault.com/questions/531560/creating-an-sails-js-application-on-aws-ami-instance))_
+ [Your own mini-Heroku on AWS (2014)](http://blog.grio.com/2014/01/your-own-mini-heroku-on-aws.html)



### PM2 (KeyMetrics)

<a title="About PM2" href="http://pm2.keymetrics.io/"><img style="width:285px;" src="https://sailsjs.com/images/deployment_pm2.png" alt="PM2 logo"/></a>

+ [Deploying with PM2](http://devo.ps/blog/goodbye-node-forever-hello-pm2/)

> Note: PM2 isn't really a hosting platform, but it's worth mentioning in this section just so you're aware of it.


### OpenShift (Red Hat)

<a href="https://www.openshift.com/"><img style="width:350px;" alt="Red Hat™ OpenShift logo" src="https://sailsjs.com/images/deployment_openshift.png"/></a>

+ [Deploying a Sails / Node.js application to OpenShift (2017)](https://gist.github.com/mikermcneil/b6136aa219f6d15b01a05b14cc681fcb)
+ [Listening to a different IP address on OpenShift (2017-2018)](https://coderwall.com/p/dhhfcw/sailsjs-listening-on-a-different-ip-address) _(courtesy [@otupman](https://github.com/otupman))_
+ [Get Sails/Node.js running on OpenShift (2017)](https://gist.github.com/mdunisch/4a56bdf972c2f708ccc6) _(Warning: quite out of date, but still useful for context.  Courtesy [@mdunisch](https://github.com/mdunisch).)_

<!--
### Xervo (formerly Modulus)

<a href="https://xervo.io"><img alt="Xervo logo" style="display: inline-block; width: 85px;" src="https://sailsjs.com/images/deployment_xervo.png"/>&nbsp; &nbsp;<img alt="Modulus logo" style="display: inline-block; width: 85px;" src="https://sailsjs.com/images/deployment_modulus.png"/></a>

+ [Customer Spotlight: Sails.js](https://blog.xervo.io/sails-js)
-->

### Nanobox

+ [Getting Started: A Simple Sails.js App (2017)](https://content.nanobox.io/a-simple-sails-js-example-app/) on Nanobox
+ [Quickstart: nanobox-sails](https://github.com/nanobox-quickstarts/nanobox-sails)
+ [Official Sails.js Guides](https://guides.nanobox.io/nodejs/sails/)
+ [Official Nanobox Docs](https://docs.nanobox.io)
+ [Nanobox Slack](https://slack.nanoapp.io)


### exoscale / CloudControl

+ [Deploying a Sails.js application to exoscale / CloudControl](https://github.com/exoscale/apps-documentation/blob/88d9f157093f0690f139337ff934c027482d4727/Guides/NodeJS/Sailsjs.md) _([rendered version of tutorial](https://webcache.googleusercontent.com/search?q=cache:gq8UZXarNq8J:https://community.exoscale.ch/documentation/apps/nodejs-app-sailsjs/+&cd=1&hl=en&ct=clnk&gl=us))_


### RoseHosting

 + [Install Sails.js with Apache as a reverse proxy on CentOS 7 (2016)](https://www.rosehosting.com/blog/install-sails-js-with-apache-as-a-reverse-proxy-on-centos-7/)
 + [Install Sails.js on Ubuntu (2014)](https://www.rosehosting.com/blog/install-the-sails-js-framework-on-an-ubuntu-vps/)


### More options

+ Like [Heroku](https://stackshare.io/heroku), there are many [other Platform as a Service (PaaS) solutions that support Node.js/Sails.js](https://stackshare.io/heroku/alternatives).
+ Like [Microsoft Azure](https://stackshare.io/microsoft-azure) and [EC2](https://stackshare.io/amazon-ec2), there are many [other Node.js/Sails.js-compatible "bare-metal"/IaaS cloud servers](https://stackshare.io/amazon-ec2/alternatives).
+ Like [Cloudflare](https://stackshare.io/cloudflare), there are [other great CDNs for optimized hosting of your static assets](https://stackshare.io/cloudflare/alternatives).

<docmeta name="displayName" value="Hosting">
