# Caveats/Gotchas


## Function bindings

The most common thing I see when teaching people JavaScript, even people who have been working with jQuery for a long time, is understanding how function execution works in JavaScript. 

There are 4 ways to call a function in JavaScript:

as a stand-alone function:

```javascript
var myFunction = function () {
  console.log('"this" is', this);  
};

myFunction(); // will log out window (or global in Node)
```

as a property of an object:

```javascript
var obj = {};
obj.myFunction = function () {
  console.log('"this" is', this);  
};

obj.myFunction(); // will log out the 'obj' object

// now here's where it gets tricky (continuing the same code as above)

var myFunc = obj.myFunction;

myFunc(); // what will this log out as its 'this'?

// the answer is that again, the "window" object is 'this'.
```

So the question is why?

In JavaScript "this" isn't magic. It's just an object. It's whatever you tell it to be when you're calling the function. It's simply the context object for that function execution.

So in the case of the second example where we just do `myFunc();` we're not giving it anything to use as a context, so it uses the global object "window" because a function body will always have a "this" inside that represents the context of execution.

These are not problems JS developers are used to thinking about when building apps with jQuery. jQuery nearly always hands you the current element as the 'this' for event handlers, etc. But...as soon as we start doing Backbone it trips people up a lot. The following is an example of what I see pretty much every person new to Backbone do:

```javascript
var Backbone = require('backbone'),
    templates = require('templates');

module.exports = Backbone.View.extend({
  initialize: function () {
    // register a handler so that anytime the model changes, 
    // call the render function.
    // THIS WILL NOT WORK!
    this.model.on('change', this.render);
  }, 
  render: function () {
    this.$el.html(template.thing());
  }
});
```

The problem is that inside the render function, "this" won't be the Backbone view if it's triggered by a change in the model. You may say, "Well we're specifying it as a property of something." In some ways, yes, you wrote `this.render` but you're actually just referencing the resulting function and giving the specific function, without context to the event registry.

In fact, what you're doing is no different than this:

```javascript
// register a handler so that anytime the model changes, 
// call the render function.
// THIS WILL NOT WORK!
var render = this.render;
this.model.on('change', render);
```

So, the render function doesn't have any context when you just provide a pointer to that function (even though the function may 'live' on the view). 

So, here's what you do. You can bind a function to a context before it's run like this. 

```javascript
// THIS will work as expected
// Backbone's event system takes a third argument for the
// context to execute the function with.
this.model.on('change', this.render, this);
```

This leads into the other two ways to execute a function:

```javascript
myFunction = var myFunction = function () {
  console.log('"this" is', this);  
};

var someOtherContext = {
  name: 'blah'
};

// both of these will log out the 'someOtherContext' object
myFunction.apply(someOtherContext); 
myFunction.call(someOtherContext);

// in ES5 compliant (read modern) browsers you can also do this
myFunction = myFunction.bind(someOtherContext);
myFunction(); // "this" will be someOtherContext

// or if you're using underscore it doesn't matter if you're
// in a modern browser or not. You can just do this:

myFunction(_.bind(myFunction, someOtherContext));
myFunction(); // for the same result
```

That's function binding in a nutshell. It's really just info about how the language works. But it's such a common issue with people who are new to Backbone, or less familiar with JavaScript as a language that I figured it was worth explaining.


## Gotchas regarding DOM manipulation in views (they may still be detached)

Another common issue is understanding what `this.$()` does in views. 

If you've got a div in your template that looks like this: `<div id="myDiv"/>` and we do this in the render function you'll have a problem:

```javascript
var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  render: function () {
    this.$el.html(templates.myTemplate());
    // then you try to access that div like so:
    $('#myDiv').on('click', this.doSomething);
    
    // ^^ myDiv won't be found! If the root element of this
    // view isn't already attached to the DOM.
    return this;
  }
});
```

What many people don't know is that you can pass a second argument to the jQuery function `$(selector)` that is the DOM tree to look within. So if you did `$('#myDiv', this.el)` in the example above, it would always work. 

Backbone tries to make things easy for us, rather than having to do that. Remember to always use `this.$()` instead of just `$()` within views. That's just a helper for passing the view's base element to the jQuery function. It's functionally equivalent to passing `this.el` as the second argument. 


## Failed Ajax requests

Inevitably with single page apps you have to deal with issues of bad connectivity, or issues of stale data and/or expired sessions.

If we're using restful JSON APIs we'll be making requests throughout the applications lifecycle.

As a starting point, I've stubbed out a global error handler for Ajax requests. jQuery makes it fairly simple: http://api.jquery.com/ajaxError. So we register and add a handler here: https://github.com/caagency/caa-template-jqmapp2/blob/development/clientapp/app/views/main.js that just pops up a dialog. This could be modified to make a distinction between session expiration errors and bad connectivity errors. 
