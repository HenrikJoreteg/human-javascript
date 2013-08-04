# Views

In the interest of being terribly cliché, views are where the rubber hits the road. It's where you model layer meets the DOM.

There are many approaches to handling this layer, all with varying degrees of magic. 

Continuing our theme of readability and seperation of concerns we want something simple, explicit, and declarative. 

Backbone views provide some basic constructs for how might one build this layer, but it doesn't actually solve much for you. Personally, I think that's great, because then we can use whatever templating and binding mechanisms that we want.

So, we'll generally follow the pattern of Backbone views, but before we get further let's describe what that means:

1. One root element that the view controls available as `this.el` within the view.
2. One primary model and/or collection, available as `this.model` and `this.collection` respectively.
3. A `render()` method responsible for populating and maintianing that base element with the proper contents.
4. An optional `initialize()` method for any necessary setup.
5. Shorthand way to register DOM event handlers (the `this.events` hash).
6. A way of disposing of the view and any listeners that it registered.

Then in addition we'll extend that with a way to do:

1. Simple templating using our precompiled template functions described in ch. 8
2. A simple way to declare various model/template bindings.


## Basics

A view's job is to maintain a portion of the DOM. This means each view has *one* root element at all times and is responsibile for its contents. 

Within a given view, you'll often find it makes sense to segment things into subviews.

Which begs the question: how do you decide how you split out your app layout into views?

I generally start with a single main view, that I put in `views/main.js`. The main view has the `<body>` as it's root element. It rendered once and creates the main layout of your app.

The layout will vary from one app to the next, but typically, you'll have some ever-present elements that are part of the layout (navigation, etc.) and often I will have some type of main content container that swaps out based on the URL. I typically give that an `id` of `pages` and then render a `PageView` into that container based on the URL.

You have to make a judegment call of the best way to segment things into manageable, logical containers. 
A good rule of thumb is that try to encapsulate views by the models you'll use to control them.

For example, if you've got a list of items you want to render, you may have have a page view that is rendered inside the main page container. That page view would render any headers for that page as well as a list container (a `<ul>` perhaps). 

That page would take the collection you plan to render into that container as its `collection`, then the page view would manage adding/removing individual views (one for each model).

If there isn't a lot of behavior associated with each line item, you may choose to just handle the rendering of individual items in the view containing the collection. You'll simply have to make a determination based on how much behavior is associated with each item in the list. If it's fairly behavior-less or log-like (say a chat room for example) you may just want to render them into the container and be done. If it's more interative like an tour scheduling app where you're dragging items around, editing them, and there's lots of associated data with each one. You'll probably want a view to contain the behavior of each item.

Take a look at the associated demo app to see examples of each approach to handling collections.


### Registering DOM event handlers

In wiring up a view to the DOM you'll very often want to respond to interactions from the user. 

Because registering a handler to a particular method in your view and binding it to execute in the context of the view is such a common pattern backbone gives us a declarative short way to register all the handlers we'll need for a given view. 

This is done through the `events` hash. 

It works like this:

```javascript
var StrictView = require('strictview');
var templates = require('templates');


module.exports = StrictView.extend({
  template: templates.widget,
  events: {
    // the event + element: the name of the handler
    'click .delete': 'handleDeleteClick',
    'keyup input.search': 'handleSearchKeyUp'
  },
  render: function () {
    // this we inherit from strictview
    this.basicRender();
  },
  handleDeleteClick: function () {
    this.model.delete();
  },
  handleSearchKeyUp: function () {
    var inputVal = this.$('.search').val();
    this.collection.each(function (model) {
      model.matchesSearch = this.name.indexOf(inputVal) !== -1;
    });
  }
});
```

That events hash is equivalent to doing the following inside the render method. 

```javascript
  render: function () {
    // this we inherit from strictview
    this.basicRender();
    this.$el.delegate('.delete', 'click', _.bind(this.handleDeleteClick, this));
    this.$el.delegate('input.search', 'keyup', _.bind(this.handleSearchKeyUp, this));
  },
```

But the events hash is less verbose and arguably more readable.


### Binding model values to templates

In order to keep our sepeartion of concerns, very rarely do I set style attributes directly from javascript. I belive that is a job for CSS. So much of what I do is flip classes based on property values on the underlying model.

Backbone kind on loosly encourages you to just re-render views entirely when something changes. In a lot of cases that's totally fine, but I like only changing the specific thing that needs updating when the underlying model changes. Obviously, this can be a bit more tedious because you have to bind each thing explicitly somehow. For this, we use a tool called "strictview" that allows you to make declarative bindings. 

Much in the same way as you declare event handlers in the event hash, we can now declare bindings of various types in our views as follows:

```javascript
var StrictView = require('strictview');
var templates = require('templates');


module.exports = StrictView.extend({
  template: templates.widget,
  events: {
    'click .delete': 'handleDeleteClick',
    'keyup input.search': 'handleSearchKeyUp'
  },
  // content bindings mean
  // put the name attribute of the
  // model in this view. Into the
  // element that matches the
  // '.profileName' selector as text.
  contentBindings: {
    'name': '.profileName'
  },
  // class bindings work a tad differently
  // if they're boolean attributes
  // it will add or remove a class
  // of the same name as the property.
  // If the property value is a string
  // it will maintain a class of whatever
  // that string value is on the element.
  classBindings: {
    'selected': '',
    'active': '.container'
  },
  render: function () {
    this.basicRender();
    this.handleBindings(); // <- this is what does all the binding.
  },
  handleDeleteClick: function () {
    this.model.delete();
  },
  handleSearchKeyUp: function () {
    var inputVal = this.$('.search').val();
    this.collection.each(function (model) {
      model.matchesSearch = this.name.indexOf(inputVal) !== -1;
    });
  }
});
```

In this way, you follow a similar style and pattern as backbone to also specify what properties (or computed properties) you want bound to what DOM.

As an additional bonus, all handlers are registered using backbone's `listenTo()` which handles unbinding those hanlders when the view is destroyed.


## A bit about defining bindings in templates (a la angular, ractive.js)

There are tools out there that let you specify in your templates which pieces of information go where, in your DOM and then they handle the event bindings for you magically. 

When I first started working with backbone when it was v0.3 I thought I wanted this. Basically, assume you have a template like this:

```html
<div>
  <p>Hello {{ name }}</p>
</div>
```

Then you mash that together with your model and then they're magically bound. As a paraphrased pseudo-code-y example:

```javascript
var template = require('compiledTemplateFromSomewhere');
var model = require('someModel');

document.body.appendChild(template(model));

// then if you changed the model
model.set('name', 'Sue');

// the DOM would be magically update to be:
/*
<div>
  <p>Hello Sue</p>
</div>
*/
```

This is all fine and good for inserting text into an html snippet. But what if what you actually want is a bit of logic or what you want to bind is another attribute, like a `class`, `src`, `href`? No big deal per-sé but it just starts getting more convoluted and pretty soon you're writing too much logic into your templates. Why is that bad? It could be argued, but I feel like it's the wrong place to read logic. I find `if` statements and functions in javascript much easier to read in javascript files with the rest of the logic than sprinkled into the HTML. That reminds me of PHP or some other mix-in-these-special-tags type of language. Plus it just makes re-factoring less smooth, because you've got bits and pieces of logic spread out in more places.

