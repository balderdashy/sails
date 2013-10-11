#Hooks


Hooks were introduced to Sails as part of major refactor designed to make the framework more modular and testable.
Their primary purpose for now is to pull all but the most minimal functionality of Sails into independent modules.
Eventually, this architecture will allow for built-in hooks to be overridden, and even new hooks to be mixed-in to projects (a proper plugin system).

However, right now, **the hooks API is not stable** and it will continue to undergo major changes for some time to come.
If you are interested in extending functionality in one of these hooks, please do it as a pull request to the Sails core-- this will make it easier to stay organized and ensure that your code gets looked over and merged.

Thanks so much for your interest and contributions to Sails.

-Mike