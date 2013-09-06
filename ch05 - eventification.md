# Using events: Modules talking to modules

How do you keep your modules cleanly separated? Sometimes modules are dependant on other modules but we still want to be able to keep them loosely coupled? One good technique is triggering lots of events that can be used as hooks by other code. Many of the core components in node.js are extensions of the EventEmitter class. This means you can register handlers that get called when events happen to that object much like you would do in the browser when you want to register a click handler for an element on the page.

I find that developers often assume that events are kind of magical or special things in javascript, but they're not. In fact, building an event emitter from scratch is a really great learning exercise. They're really quite simple. Your just saying: please call this function when this thing happens. Typically, you'll see code like this:

In browsers:
```js
document.getElementById('something').addEventListener('click', function () { ... }, false);
```

In jQuery it looks like this:
```js
$('#something').click(function (event) { ... });
// or
$('#something').on('click', function (event) { ... });
```

In EventEmitter it looks like this:
```js
myEventEmitter.on('someEvent', function () { ... });
```

But they all do the same thing: they store a reference to the function you handed it (usually by adding it to an array of functions internally). Then, when the event happens, they call all the functions in the relevant array with information about the event. That's it! No magic.

This pattern is really useful when building reusable components yourself. Exporting objects and classes that inherit from some type of event emitter means that the code using your module can specify what they care about, rather than the module having to know. 

At points of interest within your module where you think some external source may care, you can just call `this.emit('someEventName', {some: 'data'})` and if there are any handlers for that event, they'll be called.

There are lots of implementations of event emitters with various features. Features usually involve various ways of registering and unregistering event listeners. For example, you may want to only register a handler that only gets called the first time an event happens. So for this many event handlers have a `once()` method alongside the `on()` method. In addition, some event handlers give you a way to listen to all events emitted by a certain object, or perhaps all events in a certain namespaced. These features can be useful for logging out all events (so you can debug), or for proxying events from one event source to another object.

Browsers don't expose a base EventEmitter class we can just use, so for clientside code we need to include one in order to take advantage of this pattern.

We use a slightly modified version of a really awesome and lightweight one that was written by the LearnBoost guys: [@tjholowaychuk](https://twitter.com/tjholowaychuk), [@rauchg](https://twitter.com/rauchg) and company. It's [wildemitter](https://github.com/HenrikJoreteg/wildemitter) on my github if you're curious. 

Beyond standard `on()`, `off()` and `once()` methods it adds two main features:

1. Wildcard event handlers for listening to all events in an object. For example: `emitter.on('*', function (eventName, event) { ... })` or `emitter.on('namespace*', function (eventName, event) { ... })`.

2. Grouped event handlers, meaning you can specify which group the handlers are a part of when you register them and then unregister all the handlers in the group at once:

```js
var WildEmitter = require('wildemitter');

var emitter = new WildEmitter();

// register one handler 
emitter.on('something', 'group1', function () { ... });
// register another handler in the same group
emitter.on('someOtherEvent', 'group1', function () { ... });

// then release both of them
emitter.releaseGroup('group1');
```

Details and implementations aside the same basic concepts of adding and removing handlers are available in all event emitters.

As an example, here's a simplified version of the `andbang.js` library which is an SDK for talking to the And Bang API.

```javascript
// require our emitter
var Emitter = require('wildemitter');

// Our main constructor function
var AndBang = function (config) {
  // extend with emitter
  Emitter.call(this);
};

// inherit from emitter, but retain constructor
AndBang.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: AndBang
  }
});

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

```javascript
var AndBang = require('andbang');
var api = new AndBang();

// now this handler will get called any time the event gets triggered
api.on('nameChanged',  function (newName) { /* do something cool */ });
```
    
This pattern makes it easy to expose functionality without needing overly specific knowledge about how it's going to be used.
