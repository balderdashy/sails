# Stability index

Throughout the documentation and in README files in Sails, you will see indications of a section's stability. The Sails framework is still somewhat changing, and as it matures, certain parts are more reliable than others. Some are so proven, and so relied upon, that they are unlikely to ever change at all. Others are brand new and experimental, or known to be hazardous and in the process of being redesigned.

Stability indices are used to describe individual methods, events, and configuration settings _as well_ as sub-modules of Sails core such as core hooks.  The latter affordance is a soft science-- the core team labels hooks with stability indices in order to provide a better experience for developers building plugins for Sails and/or contributing to Sails core.

When a stability index refers to a module like a core hook, note that that index refers to the **features of that hook which are _explicitly public_**.  For example, if the documentation for a hook mentions that it "exposes" a property called `foo` on the `sails` app object, then you can _only rely on that property_ to respect the hook's the stability level if it is also clearly marked as "public" elsewhere in the hook documentation.  If in doubt, submit a pull request to the relevant hook's README file in the [GitHub repository for Sails core](https://github.com/balderdashy/sails) and add a question to the FAQ section.

The stability indices are as follows:

##### Stability: 0 - Deprecated
This feature is known to be problematic, and changes are planned.  Do not rely on it in new code, and be sure to change existing code before upgrading.  Use of the feature may cause warnings.  Backwards compatibility should not be expected.

##### Stability: 1 - Experimental
This feature is subject to change or removal in future major releases of Sails.

##### Stability: 2 - Stable
This feature has proven satisfactory. Compatibility with existing Sails apps and the plugin ecosystem is a high priority, and so stable hooks/features/etc. will not be broken or removed in future major releases unless absolutely necessary.

##### Stability: 3 - Locked
This hook/feature/etc. will not undergo any future API changes, except as demanded by critical fixes related to security or performance.  Please do not propose usage/philosophical changes for features/hooks/etc. at this stability index; they will be refused.



### Notes
> - Sails' stability index, and much of the verbiage of this file, is based on [the Stability Index used by Node.js core](https://nodejs.org/api/documentation.html#documentation_stability_index).

<docmeta name="notShownOnWebsite" value="true">
