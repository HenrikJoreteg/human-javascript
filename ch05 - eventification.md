# Using events: Modules talking to modules

How do you keep your modules cleanly separated? Sometimes modules are dependant on other modules. How do you keep them loosely coupled? One good technique is triggering lots of events that can be used as hooks by other code. Many of the core components in node.js are extensions of EventEmitter the reason is that you can register handlers for stuff that happens to those items just like you can register a handler for someone clicking a link in the browser. This pattern is really useful when building reusable components yourself. Exporting things that inherit from event emitters means that the code using your module can specify what they care about, rather than the module having to know. For example, see the super simplified version of the And Bang js library below.

There are lots of implementations of event emitters. We use a modified version of one from the LearnBoost guys: [@tjholowaychuk](https://twitter.com/tjholowaychuk), [@rauchg](https://twitter.com/rauchg) and company. It’s [wildemitter](https://github.com/HenrikJoreteg/wildemitter) on my github if you’re curious. But the same concept works for any of the available emitters. See below:

```js
// require our emitter
var Emitter = require('wildemitter');

// Our main constructor function
var AndBang = function (config) {
    // extend with emitter
    Emitter.call(this);
};

// inherit from emitter
AndBang.prototype = new Emitter();

 // Other methods
AndBang.prototype.setName = function (newName) {
    this.name = newName;
    // we can trigger arbitrary events
    // these are just hooks that other
    // code could chose to listen to.
    this.emit('nameChanged', newName);
};

// export it to the world
module.exports = AndBang;
```

Then, other code that wants to use this module can listen for events like so:

```js
var AndBang = require('andbang'),
    api = new AndBang();

// now this handler will get called any time the event gets triggered
api.on('nameChanged',  function (newName) { /* do something cool */ });
```
    
This pattern makes it easy to expose functionality without needing any knowledge of the consuming code.
