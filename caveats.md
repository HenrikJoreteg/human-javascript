## Caveats/Gotchas

### Failed ajax requests

Inevitably with single page apps you have to deal with issues of bad connectivity or issues of stale data and/or expired sessions.

If we're using restful JSON APIs we'll be making requests throughout the applications lifecycle.

As a starting point, I've stubbed out a global error handler for ajax requests. jQuery makes it fairly simple: http://api.jquery.com/ajaxError. So we register and add a handler here: https://github.com/caagency/caa-template-jqmapp2/blob/development/clientapp/app/views/main.js that just pops up a dialog. This could be modified to make a distinction between session expiration errors and bad connectivity errors. 


### Function bindings

The most common thing I see when teaching people javascript even people who have been working with jQuery for a long time is understanding how function execution works in javascript. 

There are 4 ways to call a function in javascript:

as a standalone function:

```js
var myFunction = function () {
    console.log('"this" is', this);  
};

myFunction(); // will log out window (or global in node)

```

as a propery of an object:

```js
var obj = {};
obj.myFunction = function () {
    console.log('"this" is', this);  
};

obj.myFunction(); // will log out the 'obj' object

// now here's where it gets tricky (continuing the same code as above)

var myFunc = obj.myFunction;

myFunc(); // what will this log out as it's 'this'?

// the answer is that again, the "window" object is 'this'.
```

So the question is why?

In JS "this" isn't magic. It's just an object. It's whatever you tell it to be when you're calling the function. It's simply the context object for that function execution.

So in the case of the second example where we just do `myFunc();` we're not giving it anything to use as a context so it uses the global objecxt "window" because a function body will always have a "this" inside that represents the context of execution.

These are not problems JS developers are used thinking about when building apps with jQuery. jQuery nearly always hands you the current element as the 'this' for event handlers, etc. But... as soon as we start doing backbone it trips people up a lot. The following is an example of what I see pretty much every person new to backbone do:

```js
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

The problem is that inside the render function, "this" won't be the backbone view if it's triggered by a change in the model. You may say that "well we're specifying it as a property of something". In some ways, yes, you wrote `this.render` but you're actually just referencing the resulting function and giving the specific function, without context to the event registry.

In fact, what you're doing is no different than this:

```js
    // register a handler so that anytime the model changes, 
    // call the render function.
    // THIS WILL NOT WORK!
    var render = this.render;
    this.model.on('change', render);
```

So, the render function doesn't have any context when you just provide a pointer to that function (even though the function may 'live' on the view). 

So, here's what you do. You can bind a function to a context before it's run like this. 

```js
    // THIS will work as expected
    // backbone's event system takes a third argument for the
    // context to execute the function with.
    this.model.on('change', this.render, this);
```

This leads into the other two ways to execute a function:

```js
myFunction = var myFunction = function () {
    console.log('"this" is', this);  
};

var someOtherContext = {
    name: 'blah'
};

// both of these will log out the 'someOtherContext' objec
myFunction.apply(someOtherContext); 
myFunction.call(someOtherContext);

// in ES5 compliant (read modern) browsers you can also do this
myFunction = myFunction.bind(someOtherContext);
myFunction(); // "this" will be someOtherContext

// or if you're using underscore it doesn't matter if you're
// in a modern browser or not. You can just do this:

myFunction(_.bind(myFunction, someOtherContext));
myFucntion(); // for the same result
```

That's function binding in a nutshell. It's really just info about how the language works. But it's such a common issue with people who are new to backbone or less familary with javascript as a langauge that I figured it was worth explaining.


### Rendering detatched DOM elements

Another common issue is understanding what `this.$()` does in views. 

If you've got a div in your template that looks like this: `<div id="myDiv"/>` and we do this in the redner function you'll have a problem:

```js
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

What may people don't know is that you can pass a second argument to the jQuery function `$(selector)` that is the dom tree to look within. So if you did `$('#myDiv', this.el)` in the example above, it'd always work. 

So Backbone tries to make things easy for us, so rather than having to do that. Just always use `this.$()` instead of just `$()` within views. That's just a helper for passing the view's base element to the jquery function. So, it's functionally equivalent to passing `this.el` as the second argument. 


