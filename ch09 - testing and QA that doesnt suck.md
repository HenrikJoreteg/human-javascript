# Testing and QA that doesn't suck (so your app won't)


## The problem/challenge of proper interface QA

We all know we need to test. While you're in the building phase of a browser app I tend to find that building an extensive test suite isn't necessarily worth the effort. Intefaces are inherently hard to test in that the variability of human input is part of what makes a good test for an interface. 

Also, there are things that are just a bit hard to test. For example if you support drag and drop actions in your interface it's not so easy to write a test that properly validate that it works.

Then there's the "problem" of CSS changes. The DOM can be in perfect order but if the styles are off things can look quite broken.

People have built really elaborate systems the run browser and take screenshots and does image comparisons to check if the number of pixels that have changed are above a certain threshold, etc. But that's not the type of effort and resources that are typically available to us when we're building an app like this.

There are tools like Selenium that will script a browser for you, but it's a whole lot of work and setup and then everytime you want to change something, if your tests are too specific they'll need to be constantly updated, if they're too general they'll miss stuff.

Headless browser testing is a really cool idea (phantom.js, etc), but doesn't really help you know how your app works in other browsers.

Ultimately, I don't believe you can do proper testing of an interface without a human. 

So, there must be a balance that can be struck. Between human approval and oversight and taking advantage of the things computers are good at like process, consistency, and automation.script.


## Meet the SpaceMonkey

So we built one. Yeah... I know, NIH, right!? But, there wasn't anything that did this in a way that seemed really simple and blended automation with human approval.




## Doing cross-browser testing
