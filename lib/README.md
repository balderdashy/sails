# Understanding Core

Welcome to the Sails.js Core.

The goal of this file is to provide a light overview of the structure and philosophy of Sails.js for core contributors, as well as establish code and documentation conventions.

Many of the subdirectories herein contain a `README.md` file with more information about that particular component.


## Overview

The Sails.js core runs when an app is fired up with `sails.load` or `sails.lift`.


## Stability Index

We're borrowing the stability index that is used in [Node.js core](http://nodejs.org/api/documentation.html#documentation_stability_index) partially out of allegiance, but primarily for consistency.
We may slightly modify the stability levels in the future to better correlate with the Sails project, but for now, this is a good starting place.

The description below is taken almost verbatim from the [Node.js documentation site](http://nodejs.org/api/documentation.html).

Throughout the core documentation files, you will see indications of a section's stability. The Sails API is still somewhat changing, and as it matures, certain parts are more reliable than others. Some are so proven, and so relied upon, that they are unlikely to ever change at all. Others are brand new and experimental, or known to be hazardous and in the process of being redesigned.

The stability indices are as follows:

> ###### Stability: 0 - Deprecated
> This feature is known to be problematic, and changes are
> planned.  Do not rely on it.  Use of the feature may cause warnings.  Backwards
> compatibility should not be expected.

&nbsp;

> ###### Stability: 1 - Experimental
> This feature was introduced recently, and may change
> or be removed in future versions.  Please try it out and provide feedback.
> If it addresses a use-case that is important to you, tell the node core team.

&nbsp;

> ###### Stability: 2 - Unstable
> The API is in the process of settling, but has not yet had
> sufficient real-world testing to be considered stable. Backwards-compatibility
> will be maintained if reasonable.

&nbsp;

> ###### Stability: 3 - Stable
> The API has proven satisfactory, but cleanup in the underlying
> code may cause minor changes.  Backwards-compatibility is guaranteed.

&nbsp;

> ###### Stability: 4 - API Frozen
> This API has been tested extensively in production and is
> unlikely to ever have to change.

&nbsp;

> ###### Stability: 5 - Locked
> Unless serious bugs are found, this code will not ever
> change.  Please do not suggest changes in this area; they will be refused.



## FAQ

> If you have an unanswered question that isn't covered here, and that you feel would add value for the community, please feel free to send a PR adding it to this section.
