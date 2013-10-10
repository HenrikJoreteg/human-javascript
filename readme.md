# Human JavaScript
Build powerfully simple browser apps

BUILDS: https://www.dropbox.com/sh/jn2ktxswruhcovk/FmXLx2WjP7

[Foreword by Jan Lehnardt](ch00 - foreword.md)

[Ch1: Introduction](ch01 - introduction.md)

- Acknowledgements
- This Book Will Help You Build Native HTML5 Apps
- Realtime apps are human apps
- Misconceptions, FUD and engineering
- Picking your tools

[Ch2: Client or server? Go big or go home.](ch02 - the big decision.md)

- Deciding between client/server app
- So I didn't talk you out of it? Ok, then go all out!

[Ch3: Writing code for humans.](ch03 - code for humans.md)

- Tools and trickery
- Cleverness is a double edged sword
- Code Linting

[Ch4: No more clientside spaghetti. Organizing your code.](ch04 - organizing your code.md)

- Refactor early, refactor often
- Separating views and state
- CommonJS Modules
- Grab your mooonboots
- A note on going to production
- The structure of the clientapp folder
- Creating an `app` global

[Ch5: Using events: Modules talking to modules](ch05 - eventification.md)

- Using events to build decoupled applications/reusable modules
- Emitters and events, no magic, just functions

[Ch6: Models](ch06 - models.md)

- A simple example 
- Using models for everything
- Applying this approach to the example
- Model alternatives
- Readability
- Derived properties
- Direct access to properties
- Quick note on getters/setters
- Warning!
- Type enforcement
- Better handling of lists/dates
- Summarizing models

[Ch7: Views and the DOM](ch07 - views.md)

- Introducing views
    - What they do
    - How they work
- Introducing HumanView
- A Hierarchy of Views
- Caveat: understanding `this.$`
- Registering DOM event handlers
- Binding model values to templates
- HumanView's convenience methods
- Rendering collections
- A bit about defining bindings in templates (à la AngularJS, Ractive)

[Ch8: Handling templates](ch08 - templating.md)

- Stop sending template engines to the browser
- How we used to do it
- Why that's less-than-ideal
- How we're doing it now
- The end result

[Ch9: Clientside Routing](ch09 - clientside routing.md)

- Same sh*t different URL/handing control of routing to client
- How to deal with clientside routes

[Ch10: 3... 2... 1... Blastoff!](ch10 - launch sequence.md)

- Application launch sequence
- Stepping through an example

[Ch11: Testing and QA that doesn't suck (so your app won't)](ch11 - testing and QA that doesnt suck.md)

- The problem/challenge of proper QA
- Meet the SpaceMonkey
- Doing cross-browser testing

[Ch12: Settings and configs](ch12 - settings and configs.md)
 
- The problem
- getconfig
- clientconfig
- Using them together
- Security caveats

[Ch13: Caveats/Gotchas](ch13 - caveats.md)

- Function bindings
- Gotchas regarding DOM manipulation in views (they may still be detached)
- Failed Ajax requests

[Ch14: A few closing thoughts](ch14 - conclusion.md)

- Staying up to date
- Complimentary resources
- Open Source
- Feedback
- Thank you!


