darkcerberus
============

**Dark Cerberus** is a ~~dark theme and~~ Safari/Chrome extension for the [Cerb](http://www.cerb6.com) CRM.

It began as a dark theme. Now it has other neat tricks, too, like basic tag highlighting. One day, it will take over the planet.

Changes
-------

**July 18, 2014**

v0.10alpha: A new hope

* NEW: Unanswered tickets are now emphasized in the worklist, so throw out your filters
* The groundwork for a plugin architecture is in place
* FIXED: Chrome locked up on occasion when composing messages


**July 17, 2014**

v0.09alpha: Aesthetics, performance and regex, oh my!

* Better typography (with word wrap!) in the message view
* Better visual hierarchy in dark mode
* JS performance was made twice as fast (then slowed down again with new features)
* FIXED: columns with multi-level cells were improperly tagged
* FIXED: Chrome extension did not apply styles in iframes (explore mode)
* Smarter, faster regular expression matching, so it's now used in more places
* Platform regex matches words like "iTouch" and "MBP"


**July 11, 2014: Added Chrome extensions!**

v.07alpha: Night and Day

**Major new feature: light/dark toggle!**

* Press the sun/moon to switch the lights
* Better JavaScript that don't need no global variables
* Tons of bug fixes and better, less hack-ish table traversal code
* Very rudimentary plugin support

Todo
-----
* Tag highlighting UI
* Settings page
* Mobile mode
* Highlight/colours for light mode
* Keyboard shortcuts
* Chrome: do something about the toolbar icon
* Plugins: last updated heat map