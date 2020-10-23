![Squiddy reads the docs](https://sailsjs.com/images/squidford_swimming.png)

# Sails.js Documentation

The official documentation for the current stable release of Sails is on the [master branch](https://github.com/balderdashy/sails/sails-docs) of this repository.  Content for most sections on the [official Sails website](https://sailsjs.com) is compiled from here.


## In other languages

The documentation for Sails has been translated to a number of different languages.  The list below is a reference of the translation projects we are aware of.

| Language                     | [IETF Language Tag](https://en.wikipedia.org/wiki/IETF_language_tag)  | Version |  Maintainer(s)        | Repo                               |
| ---------------------------- | ------- | ------- | ------------------ | ---------------------------------- |
| Japanese                     | `ja`    | v0.11.x | [@kory-yhg](https://github.com/kory-yhg)      | [sails-docs-ja](https://github.com/balderdashy/sails-docs/tree/ja)
| Spanish                      | `es`    | v0.12.x | [@eduartua](https://github.com/eduartua/) & [@alejandronanez](https://github.com/alejandronanez)   | [sails-docs-es](https://github.com/eduartua/sails-docs-es)
| Brazilian Portuguese         | `pt-BR` | v1.0.x  | [@Avlye](https://github.com/Avlye) | [sails-docs-pt-BR](https://github.com/Avlye/sails-docs-pt-BR)
|                              |         | v0.10.x | [@marceloboeira](https://github.com/marceloboeira)   | [sails-docs-pt-BR](https://github.com/balderdashy/sails-docs/tree/pt-BR)
| Taiwanese Mandarin           | `zh-TW` | v0.10.x | [@CalvertYang](https://github.com/CalvertYang)   | [sails-docs-zh-TW](https://github.com/balderdashy/sails-docs/tree/zh-TW)
| Korean                       | `ko`    | v0.10.x | [@sapsaldog](https://github.com/sapsaldog)   | [sails-docs-ko](https://github.com/balderdashy/sails-docs/tree/ko)
| Chinese                      | `zh-cn`    | v0.12.x | [@linxiaowu66](https://github.com/linxiaowu66)   | [sails-docs-zh-cn](https://github.com/linxiaowu66/sails-docs-zh-cn)
| French                       | `fr`    | v0.12.x | [@marrouchi](https://github.com/marrouchi)   | [sails-docs-fr](https://github.com/marrouchi/sails-docs-fr)

> Since we are now using branches to keep track of different versions of the Sails documentation, we are moving away from the original approach of using branches for different languages.  Before embarking on a new translation project, we ask that you review the [updated information below](#how-can-i-help-translate-the-documentation)-- the process has changed a little bit.



## Contributing to the Sails docs

We welcome your help!  Please send a pull request to **master** with corrections/additions and they'll be double-checked and merged as soon as possible.

Secondly, we are open to suggestions about the process we're using to manage our documentation, and to work with the community in general.  Please post to the Google Group with your ideas- or if you're interested in helping directly, contact @fancydoilies, @rudeboot, or @mikermcneil on Twitter.

#### What branch should I edit?

<!-- As we get closer to releasing a newer version of Sails, we ask that all pull requests be made to the `1.0` branch, since that content will soon replace the 0.12 docs on the main website. The only exception is if you are documenting something that isn't relevant for Sails v1. -->

To make an edit that is relevant for the latest stable version of Sails (i.e. the version on [NPM](npmjs.org/package/sails)), you'll want to edit the `master` branch of _this_ repo (what you see in the sails-docs repo by default).  The Sails core team merges master into the appropriate branch for the latest stable release of Sails, and then deploys that to sailsjs.com about once per week.

<!-- That depends on what kind of edit you are making.  Most often, you'll be making an edit that is relevant for the latest stable version of Sails (i.e. the version on [NPM](npmjs.org/package/sails)) and so you'll want to edit the `master` branch of _this_ repo (what you see in the sails-docs repo by default).  The docs team merges master into the appropriate branch for the latest stable release of Sails, and then deploys that to sailsjs.com about once per week.

On the other hand, if you are making an edit related to an unreleased feature in an upcoming version; most commonly as an accompaniment a feature proposal or open pull request to Sails or a related project, then you will want to edit the branch for the next, unreleased version of Sails (sometimes called "edge").
 -->

| Branch (in `sails-docs`)                                          | Documentation for Sails Version...                                                     | Accessible At...   |
|:------------------------------------------------------------------|:---------------------------------------------------------------------------------------|:-------------------|
| [`master`](https://github.com/balderdashy/sails-docs/tree/master) | _Bleeding edge_                                                                        | [`next.sailsjs.com`](https://next.sailsjs.com)
| [`1.0`](https://github.com/balderdashy/sails-docs/tree/1.0)       | [![NPM version](https://badge.fury.io/js/sails.png)](http://badge.fury.io/js/sails)    | [`sailsjs.com`](https://sailsjs.com)
| [`0.12`](https://github.com/balderdashy/sails-docs/tree/0.12)     | Sails v0.12.x                                                                          | [`0.12.sailsjs.com`](https://0.12.sailsjs.com)
| [`0.11`](https://github.com/balderdashy/sails-docs/tree/0.11)     | Sails v0.11.x                                                                          | [`0.11.sailsjs.com`](http://0.11.sailsjs.com)


#### How are these docs compiled and pushed to the website?

We use a module called `doc-templater` to convert the .md files to the html for the website. You can learn more about how it works in [the doc-templater repo](https://github.com/uncletammy/doc-templater).

Each .md file has its own page on the website (i.e. all reference, concepts, and anatomy files), and should include a special `<docmeta name="displayName">` tag with a `value` property specifying the title for the page.  This will impact how the doc page appears in search engine results, and it will also be used as its display name in the navigation menu on sailsjs.com.  For example:

```markdown
<docmeta name="displayName" value="Building Custom Homemade Puddings">
```

#### When will my change appear on the Sails website?

Documentation changes go live when they are merged onto a special branch corresponding with the current stable version of Sails (e.g. 0.12). We cannot merge pull requests sent directly to this branch-- its sole purpose is to reflect the content currently hosted on sailsjs.com, and content is only merged just before redeploying the sails website.

If you want to see how documentation changes will appear on sailsjs.com, you can visit [preview.sailsjs.com](http://preview.sailsjs.com). The preview site updates itself automatically as changes are merged into the master branch of sails-docs.


#### How can I help translate the documentation?

A great way to help the Sails project, especially if you speak a language other than English natively, is to volunteer to translate the Sails documentation.  If you are interested in collaborating with any of the translation projects listed in the table above, contact the maintainer of the translation project using the instructions in the README of that fork.

If your language is not represented in the table above, and you are interested in beginning a translation project, follow these steps:

+ Fork this repo (`balderdashy/sails-docs`) and change the name of your fork to be `sails-docs-{{IETF}}` where {{IETF}} is the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) for your language.
+ Edit the README to summarize your progress so far, provide any other information you think would be helpful for others reading your translation, and let interested contributors know how to contact you.
+ Send a pull request editing the table above to add a link to your fork.
+ When you are satisfied with the first complete version of your translation, open an issue and someone from our docs team will be happy to help you get preview it in the context of the Sails website, get it live on a domain (yours, or a subdomain of sailsjs.com, whichever makes the most sense), and share it with the rest of the Sails community.


#### How else can I help?

For more information on contributing to Sails in general, see the [Contribution Guide](sailsjs.com/contributing).



## License

[MIT](./LICENSE.md)

The [Sails framework](https://sailsjs.com) is free and open-source under the [MIT License](https://sailsjs.com/license).

_(And the files in this repo are too.)_

