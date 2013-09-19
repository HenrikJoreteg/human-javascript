# Testing and QA that doesn't suck (so your app won't)


## The problem/challenge of proper interface QA

We all know we need to test. While in the building phase of a browser app I find that building an extensive test suite isn't necessarily worth the effort. Interfaces are inherently hard to test in that the variability of human input is part of what makes a good test for an interface. 

Also, there are things that are just a bit hard to test. For example, if you support drag and drop actions in your interface it's not so easy to write a test that properly validates that it works.

Then there's the "problem" of CSS changes. The DOM can be in perfect order but if the styles are off things can look quite broken.

Some people build really elaborate QA systems that load their app into a headless browser and takes screenshots that are compared against reference images, etc. But the amount of effort and setup required for that is simply not practical in most cases.

There are also tools like Selenium that will script a browser for you, but it's a whole lot of work and setup, and then every time you want to change something, if your tests are too specific they'll need to be constantly updated. And if they're too general they'll miss stuff.

While headless browser testing is a really cool idea (phantom.js, etc), it doesn't really help you know how your app works in other browsers.

Ultimately, I don't believe you can actually do proper testing of an interface without a human. 

So, there must be a balance that can be struck between human approval and oversight and taking advantage of the things computers are good at like process, consistency, and automation.


## Meet the SpaceMonkey

So we built one. Yeah...I know, NIH, right!? But, there wasn't anything out there that did this in a way that seemed really simple and blended automation with human approval.


## Doing cross-browser testing
