# Views

In the interest of being terribly cliché, views are where the rubber hits the road. It's where your model layer meets the DOM.

Before we get into the details, let's talk a bit about why I believe views are a great pattern. The main thing they give us is a clean way to encapsulate and store all the logic for how your application interacts with the DOM. In fact, it's even more specific than that; we use them to contain all the logic for a *certain element* within the DOM. Each view is responsible for the content, event handling, and updating of a single element and the event handlers in views translate user actions into changes to models.

As I've already alluded to in previous chapters, separating application models and views buys us a *lot* of flexibility. We can change the layout and HTML structure of the whole app without having to change anything about how the app gets, stores or updates its data from an API. So in the same way that CSS helps us clearly separate the styling of a document from the HTML content, views help us separate DOM creation, updates, and events from the model layer in our app.

Another *huge* benefit of views is that they let us keep all event handlers (click handlers, etc.) cleanly bundled with the relevant portion of the DOM. If you've ever tried to build a single page app without views, you'll know that managing large numbers of event handlers tends to be a big source of bugs, memory leaks, and messy code.

There are many tools, frameworks, and approaches to handling this layer – all with varying degrees of magic.

So, continuing our theme of striving for readability and separation of concerns, we want something simple, explicit, and declarative.

Backbone views provide some really great basic patterns for building the view layer:

1. One root element that the view controls, available as `this.el` within the view.
2. One primary model and/or collection, available as `this.model` and `this.collection` respectively.
3. A `render()` method responsible for populating and maintaining that base element with the proper contents.
4. An optional `initialize()` method for any necessary setup.
5. Shorthand way to register DOM event handlers (the `this.events` hash).
6. A way of disposing of the view and any listeners that it registered.

But, they're *quite* basic so in addition, we'll extend Backbone views to enable:

1. Simple templating using our precompiled template functions described in Chapter 8.
2. A simple way to declare model/template bindings.


## Introducing AmpersandView

As I mentioned Backbone views are very limited in scope – quite intentionally so. The following explanation is pulled straight from the [Backbone docs](http://backbonejs.org/#View):

> Backbone views are almost more convention than they are code — they don't determine anything about your HTML or CSS for you, and can be used with any JavaScript templating library. The general idea is to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the page.

Backbone's general approach is to provide some simple components and patterns, and it's up to you to apply them as you wish. This non-prescriptive flexibility is a big reason why Backbone has become as popular as it has.

However, as you start to build more and more apps you find yourself solving similar problems over and over. In pure Backbone projects we found ourselves always creating a `BaseView` that contained a lot of the common helpers and patterns we wanted in all our views, and we used that to build all our views in the app. One day I found myself copying and pasting one of the `BaseView`s from one project to another, and just decided to put in on npm instead.

That's how AmpersandView was born. It's like a Backbone view but it gives us a few additional goodies.

Specifically, it gives us the following:

1. Declarative data bindings.
2. A `.renderWithTemplate()` method that does several things we want to do on every render.
3. A `.listenToAndRun()` convenience method for binding view methods to model events, while maintaining the view as the context and triggering them right away.
4. A `.renderCollection()` method for rendering a view for each item in a collection within a given container element in the view.

We'll take a look at each of those shortly. But first, let's figure out how we're going to structure our views within the app.


## A Hierarchy of Views

As you start to build an application with views, you'll find it makes sense to segment things into subviews. Which raises the question, how do you determine what portions of the app layout to split into subviews?

I generally start with a single main view, that I put in `views/main.js`. The main view has the `<body>` as its root element. It's only rendered once and creates the main layout of the app, often rendering several subviews. It also becomes the logical place to register "global" event handlers for things like keyboard shortcuts or app-wide click handlers.

The layout will vary from one app to the next, but there are typically some ever-present elements that are part of the layout (navigation, etc.) and often I will have some type of main content container that swaps out based on the URL. I typically give that an `id` of `pages` and then render a `PageView` into that container based on the URL using a little helper module called [ampersand-view-switcher](http://ampersandjs.com/docs#ampersand-view-switcher)

The view switcher is just a way to handle swapping out views. By default it just renders and appends the view you give it to the container and removes any existing one that may be there currently. But we can also provide custom ways to transition those. We may, for example, want the page to be able to set the `<title>` on the page.

Here's an example of how a main view might look if we're using AmpersandView:

```javascript
var AmpersandView = require('ampersand-view');
var ViewSwitcher = require('ampersand-view-switcher');
var templates = require('./templates');


module.exports = AmpersandView.extend({
  // Our template function that returns an HTML string
  // this can also just be a string. Template language
  // is irrelevant. It just needs to be a function that
  // takes an argument and returns a string.
  template: templates.main,

  render: function () {
    // Inherited from AmpersandView, it renders the main template
    // and inserts it into the root element.
    this.renderWithTemplate();
    // set up our page switcher for that element
    this.pageSwitcher = new ViewSwitcher(this.get('#pages'), {
      // here we provide a few things we'd like to do each time
      // we switch pages in the app.
      show: function (newView, oldView) {
        // set our document title
        document.title = newView.pageTitle || 'my awesome app';
        // scroll to the top
        document.body.scrollTop = 0;
        // perhaps store a reference to our current page on our
        // app global for easy access from the browser console.
        app.currentPage = view;
      }
    });
  }
});
```

You will have to make a judgement call on the best way to segment things into manageable, logical containers for your application. Generally, a good rule of thumb is try to encapsulate views by the models you'll use to control them.

For example, let's assume you've got a certain URL that represents a page that should show a list of items. In this case you have a page view that is rendered inside the main views' page container. That PageView would render any headings for that page, as well as a basic list container (a `<ul>` perhaps) for your list of items.

That page would take the collection you plan to render into that container as its `collection` property, then we could use the `renderCollection` method to manage adding/removing individual views (one for each model).

If there isn't a lot of behavior associated with each line item, you may choose to handle the rendering of individual items in the view containing the collection. You'll simply have to make a determination based on how much behavior is associated with each item in the list. If it's fairly behavior-less or log-like (say a chat room, for example) you might want to render them into the container and be done. If it's more interactive, like an tour scheduling app where you're dragging items around, editing them, and there's lots of associated data with each one, then you'll probably want a view to contain the behavior of each item.

Take a look at the associated demo app to see examples of each approach to handling collections.

You can find the app on my [GitHub account](https://github.com/HenrikJoreteg/humanjs-sample-app)


### Caveat: understanding `this.$` and `this.get`

Inside the example above, in the `render` method, you'll notice that we pass: `this.get('#pages')` in Backbone you'd do `this.$('#pages')[0]` as the `el` argument for the subview. You may wonder, why not just pass `$('#pages')` or even just `document.getElementById('pages')`?

The reason is we can't assume that the view is attached to the main DOM tree when this method is called. If you haven't yet attached it, the other selector queries wouldn't be able to find the right elements because they're not in the main document tree yet. In fact, often a parent view will call `render()` on a subview as part of its own render method, and then attach the result to the DOM. This is entirely intentional because it's much faster for the browser to create the DOM elements outside of the main DOM tree, only attaching and painting them once.

So, to deal with this problem, Backbone Views create a method named `$` for each view. This method is functionally equivalent to a normal jQuery selector such as `$('.item')`. *But*, it only looks for matches within the view's element. Not only is it faster (because there's less DOM to traverse) but more importantly, it finds the elements that match your selector within the view's element *even if it's not yet been attached to the DOM*. Ampersand-View's `.get()` method works similarly in that it just searches *within the view's root element* to retrieve matching items.

If that was all a bit too complex, just know that you should generally use `this.$('.yourSelector')` or `this.get` instead of `$('.yourSelector')` when trying to grab elements within a view.


### Registering DOM event handlers

In wiring up a view to the DOM, you'll often want to respond to interactions from the user.

Because registering a handler to a particular method in your view and binding it to execute in the context of the view is such a common pattern, Backbone gives us a declarative short way to register all the handlers we'll need for a given view.

This is done through the `events` hash.

It works like this:

```javascript
var AmpersandView = require('ampersand-view');
var templates = require('templates');


module.exports = AmpersandView.extend({
  template: templates.widget,
  events: {
    // The event + element: the name of the handler
    'click .delete': 'handleDeleteClick',
    'keyup input.search': 'handleSearchKeyUp'
  },
  render: function () {
    // This we inherit from ampersand-view
    this.renderWithTemplate();
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
    // This we inherit from ampersand-view
    this.renderWithTemplate();
    $(this.el).delegate('.delete', 'click', _.bind(this.handleDeleteClick, this));
    $(this.el).delegate('input.search', 'keyup', _.bind(this.handleSearchKeyUp, this));
  },
```

But the events hash is less verbose and arguably more readable.


### Binding model values to templates

In order to keep our separation of concerns, very rarely do I set style attributes directly from JavaScript. I believe that is a job for CSS. So much of what I do is flip classes based on property values on the underlying model.

Backbone kind of loosely encourages you to just re-render views entirely when something changes. In a lot of cases that's totally fine, but I like only changing the specific thing that needs updating when the underlying model changes. Obviously, this can be a bit more tedious because you have to bind each thing explicitly somehow.

This is where AmpersandView comes in handy. Much in the same way that we declare event handlers in the `events` hash as described above, we can also declare data bindings of various types in our views as follows:


```javascript
var AmpersandView = require('ampersand-view');
var templates = require('templates');


module.exports = AmpersandView.extend({
  template: templates.widget,
  events: {
    'click .delete': 'handleDeleteClick',
    'keyup input.search': 'handleSearchKeyUp'
  },
  // We simply list our bindings here
  bindings: {
    // This simple text binding means
    // we put the property value of the
    // model in this view into the
    // element that matches the
    // '.profileName' selector as text.
    'model.name': '.profileName',
    // There's a few different binding types
    // `booleanClass` bindings will add or remove
    // a class with the name provided based on
    // the truthiness of the property.
    'model.selected': {
      type: 'booleanClass',
      selector: '.container',
      name: 'active'
    }
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

In this way, you follow a similar style and pattern to Backbone to also specify what properties (or computed properties) you want bound to what DOM.

As an additional bonus, all handlers are registered using the `listenTo()` method which handles unbinding those handlers when the view is destroyed.

The [ampersandjs.com docs site](http://ampersandjs.com/docs#ampersand-dom-bindings-binding-types) has a full listing of all the available binding types.


### AmpersandView's convenience methods

#### .renderWithTemplate();

The general pattern, encouraged in the Backbone documentation is to use templates to populate the contents of a view's root element. That way, you never have to re-register any DOM event handlers because they're attached to the view's root element. With that approach (which is perfect for some uses) you can just call `.render()` any time anything changes in the model.

If you have a simple view that renders a single model, binding views becomes *very* easy at that point. You simply do something like this:


```javascript
var Backbone = require('backbone');
var _ = require('underscore');
var templates = require('templates');


module.exports = Backbone.View.extend({
  template: templates.user,
  events: {
    'click .myClass': 'myHandler'
  },
  initialize: function () {
    // Register a single change handler for the model
    this.listenTo(this.model, 'change', _.bind(this.render, this));
  },
  render: function () {
    // We simply fill the contents of the current element with
    // the rendered HTML using the model's current attributes each time.
    $(this.el).html(this.template(this.model.toJSON()));
  },
  myHandler: function () {
    // Do something
  }
});
```

At this point, any change we make to that model will simply re-render the HTML for the whole thing. Slick, simple, and easy.

However, that's not always what you want, especially in realtime apps where an incoming event could come in and change a model when you're not ready for it. But perhaps a more compelling argument is where you want to use CSS3 transitions and animations. If we want to add a class that triggers a transition, simply re-drawing the whole container won't actually trigger it because there was never really a transition.

Also, it doesn't quite feel right to me to write templates that only contain the contents of the view element:

```html
<h1>My page</h1>
<p>My content</p>
```

It seems more logical to write *the entire* template for that view which also includes the root element itself:

```html
<section class="page">
   <h1>My page</h1>
   <p>My content</p>
</section>
```

Because now, just by looking at that template, I can look at it and know what it is without having to know which view is going to use it.

In addition, if I want to include some conditional class or some other property on the root element I can do so declaratively, right in the template along with everything else, instead of having to do it in the render method of the view.

Now, enter `renderWithTemplate(contextObject)`. This simply encapsulates everything you need to do to render the view using the `template` property while also replacing the entire existing root element and making sure all the event handlers in your event hash are registered. If your `template` is a function, it will be called with the contextObject you called `renderWithTemplate` with.

At its most basic, a `template` can simply be a string of HTML, but it can be also be a function that returns a string of HTML, or a function that returns a DOM element.

#### .listenToAndRun();

Very commonly, when you want to listen to some change on a model, you're often wanting to:

1. Bind the handler so that when it's called, `this` is the view.
2. Run the bound handler once so its effect is applied to the DOM. (This avoids having to duplicate logic in the template that's already in your handler).

`.listenToAndRun()` does both of these for you.

So instead of:

```javascript
...
initialize: function () {
  this.listenTo(this.model, 'change', _.bind(this.doSomething, this));
  this.doSomething();
}
...
```

You can just do:

```javascript
...
initialize: function () {
  this.listenToAndRun(this.model, 'change', this.doSomething);
}
...
```

#### .renderCollection();

`.renderCollection()` is a lightweight way to render and maintain a collection of models within a container.

It will listen for `add`, `remove`, `sort` events on the collection and shuffle and re-draw views for each model as necessary.

You simply pass it the collection, the subview you want to render each model with, the container element to render subviews into, and the set of options you want to pass to the subview's initialize method, and it handles the rest.

Example:

```javascript
var AmpersandView = require('ampersand-view');
var templates = require('templates');
var ItemView = require('./item');


module.exports = AmpersandView.extend({
  template: templates.myPage,
  render: function () {
    this.renderWithTemplate();
    this.renderCollection(this.collection, ItemView, this.get('.myItemList'), {
      viewOptions: {
        init_option: 'option to be passed into ItemView.initialize'
      }
    });
  }
});
```

For more on AmpersandView, or to contribute and make it better, see the documentation and source on [GitHub](https://github.com/ampersandjs/ampersand-view).


## A bit about defining bindings in templates (à la AngularJS, Ractive)

There are several libraries out there that let you specify in your templates which pieces of information go where in your DOM and then they automatically create the event bindings for you.

Basically, you'd have a template like this:

```html
<div>
  <p>Hello {{ name }}</p>
</div>
```

Then you mash that together with your model and then they're automatically bound. As a paraphrased pseudo-code-y example:

```javascript
var template = require('compiled-template-from-somewhere');
var model = require('./models/some-model');

document.body.appendChild(template(model));

// Then if you changed the model
model.set('name', 'Sue');

// the DOM would be automatically be updated to:
/*
<div>
  <p>Hello Sue</p>
</div>
*/
```

It's really a matter of preference and luckily it's easy enough to switch it out for whatever method you prefer.

For simple, put-this-text-here bindings, it's all pretty straightforward.

Where things can potentially get a bit messy is if what you actually want is a bit of logic. Say you want to add/remove an item from a list of classes based on a boolean property on a model, or say you want to add/remove an entire attribute, like `checked`. In order for the template language to know that's what we want, it has to have some type of new syntax to indicate how the binding should behave.

In my opinion, this is where many of these languages go too far. They simply try to do too much declared logic in a template. Personally, it doesn't feel right to be writing code within markup.

The important thing to recognize is that both the template language approach and the declarative bindings are *really doing the same thing*. They're just a way of building a set of functions that can turn "Hey, this value changed on a model" into the actual DOM method that will update the DOM, for example: `someElement.setAttribute('href', '/my-url')`.

If you're wanting to use a templating language that can also do the bindings for you, I'd strongly recommend: [Phil Robert's domthing](https://github.com/latentflip/domthing). It's a variant of [mustache](http://mustache.github.io/) that let's you automatically bind using templates that look like this:

```html
<div class="entry">
  <h1>{{title}}</h1>
  <div class="body">
    {{body}}
  </div>
</div>
```

But it will also automatically create bindings for those properties to the resulting DOM.

## A note about re-usability

Personally, I want to make sure that anything I may want to re-use in another project doesn't depend on a certain templating language.

So, for anything that isn't specific to the app I'm building, I'd suggest just using HTML strings and declared bindings to maximize re-usability.
