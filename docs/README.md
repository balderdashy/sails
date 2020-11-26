![Squiddy reads the docs](https://sailsjs.com/images/squidford_swimming.png)

# Sails.js Documentation

The official documentation for the current stable release of Sails is on the master branch of this repository.  Content for most sections on the [official Sails website](https://sailsjs.com) is compiled from here.


## In other languages

The documentation for Sails has been translated to a number of different languages.  The list below is a reference of the translation projects we are aware of.

| Language                     | [IETF Language Tag](https://en.wikipedia.org/wiki/IETF_language_tag)  | Version |  Maintainer(s)        | Repo                               |
| ---------------------------- | ------- | ------- | ------------------ | ---------------------------------- |
| Brazilian Portuguese         | `pt-BR` | **v1.0.x**  | [@Avlye](https://github.com/Avlye) | [sails-docs-pt-BR](https://github.com/Avlye/sails-docs-pt-BR)
| Chinese                      | `zh-cn`    | v0.12.x | [@linxiaowu66](https://github.com/linxiaowu66)   | [sails-docs-zh-cn](https://github.com/linxiaowu66/sails-docs-zh-cn)
| French                       | `fr`    | v0.12.x | [@marrouchi](https://github.com/marrouchi)   | [sails-docs-fr](https://github.com/marrouchi/sails-docs-fr)
| Spanish                      | `es`    | v0.12.x | [@eduartua](https://github.com/eduartua/) & [@alejandronanez](https://github.com/alejandronanez)   | [sails-docs-es](https://github.com/eduartua/sails-docs-es)
| Japanese                     | `ja`    | v0.11.x | [@kory-yhg](https://github.com/kory-yhg)      | [sails-docs-ja](https://github.com/balderdashy/sails-docs/tree/ja)
| Brazilian Portuguese         |         | v0.10.x | [@marceloboeira](https://github.com/marceloboeira)   | [sails-docs-pt-BR](https://github.com/balderdashy/sails-docs/tree/pt-BR)
| Korean                       | `ko`    | v0.10.x | [@sapsaldog](https://github.com/sapsaldog)   | [sails-docs-ko](https://github.com/balderdashy/sails-docs/tree/ko)
| Taiwanese Mandarin           | `zh-TW` | v0.10.x | [@CalvertYang](https://github.com/CalvertYang)   | [sails-docs-zh-TW](https://github.com/balderdashy/sails-docs/tree/zh-TW)

> Since we are now using branches to keep track of different versions of the Sails documentation, we are moving away from the original approach of using branches for different languages.  Before embarking on a new translation project, we ask that you review the [updated information below](#how-can-i-help-translate-the-documentation)-- the process has changed a little bit.

## Contributing to the Sails docs

We welcome your help!  Please send a pull request with corrections/additions and they'll be double-checked and merged as soon as possible.


#### How are these docs compiled and pushed to the website?

We use a module called `doc-templater` to convert the .md files to the html for the website. You can learn more about how it works in [the doc-templater repo](https://github.com/uncletammy/doc-templater).

Each .md file has its own page on the website (i.e. all reference, concepts, and anatomy files), and should include a special `<docmeta name="displayName">` tag with a `value` property specifying the title for the page.  This will impact how the doc page appears in search engine results, and it will also be used as its display name in the navigation menu on sailsjs.com.  For example:

```markdown
<docmeta name="displayName" value="Building Custom Homemade Puddings">
```

#### When will my change appear on the Sails website?

Once your change to the documentation is merged, you can see how it will appear on sailsjs.com by visiting [next.sailsjs.com](https://next.sailsjs.com). The preview site updates itself automatically as changes are merged.


#### How can I help translate the documentation?

A great way to help the Sails project, especially if you speak a language other than English natively, is to volunteer to translate the Sails documentation.  If you are interested in collaborating with any of the translation projects listed in the table above, contact the maintainer of the translation project using the instructions in the README of that fork.

If your language is not represented in the table above, and you are interested in beginning a translation project, follow these steps:

+ Bring the documentation folder (`balderdashy/sails/docs`) into a new repo named `sails-docs-{{IETF}}` where {{IETF}} is the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) for your language.
+ Edit the README to summarize your progress so far, provide any other information you think would be helpful for others reading your translation, and let interested contributors know how to contact you.
+ Send a pull request editing the table above to add a link to your fork.
+ When you are satisfied with the first complete version of your translation, open an issue and someone from our docs team will be happy to help you get preview it in the context of the Sails website, get it live on a domain (yours, or a subdomain of sailsjs.com, whichever makes the most sense), and share it with the rest of the Sails community.


#### How else can I help?

For more information on contributing to Sails in general, see the [Contribution Guide](sailsjs.com/contributing).


## License

[MIT](https://sailsjs.com/license)

The [Sails framework](https://sailsjs.com) is free and open-source under the [MIT License](https://sailsjs.com/license).

