# Models

## A simple example 

Let's say you have a list of items. When a user clicks on an item, you want to visually mark it as selected. Someone used to building simple apps would probably do something like this:

```javascript
// register a click handler on the parent list
$('ul.theList').delegate('click', 'li', function () {
  // toggle a class on the clicked item
  $(this).toggleClass('selected');
})
```

So now, clicking on an item will toggle a class. jQuery's `toggleClass()` method will check whether it's already got the class and add or remove it as necessary. Great! we're done!

Err... well typically if you're going to select something it's for a reason, right? So our app is going to want to *do* something with the selected item or items. 

Let's say the user has selected several things and now wants to delete them by clicking a delete button. No problem, you say, we just add a button handler that find the ones with the selected class and deletes them.

```javascript
$('button.delete').click(function () {
  // get our seletedDOM items, loop through them
  $('ul.theList li.selected').each(function () {
    // but we also have to have a way to figure out what
    // ID each one of these things represent so we can pass
    // the correct info to the server. So, let's assume we use
    // HTML5 data attributes. Luckily jQuery's data() method
    // reads all those and returns them as an object.
    var id = $(this).data('serverId');
    var listId = $(this).data('listId');
    $.ajax({
      type: 'delete',
      url: '/lists/' + listId + '/widgets/' + id,
      success: function () {
        // do something
      },
      error: function () {
        // let the user know, somehow
      }
    })
  }); 
});
```

Ok, not too terrible, you say? 

Well now what if we've got these additional requirements?

1. There isn't just one list, there are several on the page at once. There are some actions that can be performed in bulk, but only for some of the items in some of the lists.
2. There are some items you can't delete, becase you don't have permission to, but you can still select them and annotate them.
3. Deleting the item is only one of 6 different possible actions you can take with each item.
4. You have to support full keyboard control as well as handling mouse clicks. 
5. You now want to support selecting the top item, holding shift and clicking the bottom one to select a range.


### If you continue this same approach, you're in deep doo doo

You can handle adding features to a point. But you will reach a point where you start arguing against adding features, not because you don't think they're good ideas, but because you're scared to implement them because of the headaches and bugs it will inevitabily cause.

Welcome to nearly everyone's first single page app experience.


### Enter Models

If you've never used models in clientside code, it's not as intimidating as it may sound. The idea is simply that we create some data structures in the browser, seperate from the DOM, that hold the data that we got from the server as well as any client specific data or state. 

The "selected" state as described above is a good example of client-specific state, meaning when we go to update a entry in the API we're not going to send `{selected: true}` as one of its properties. The server doesn't care about that, it's just used to track the state of the user interface.

So, what is a model anyway? What does it give us?

The fundamental thing a model should provide is observability. What do I mean? Well, in the same way you can register an event listener in the browser that responds to a form input value changing:

```javascript
document.getElementById('myInput').addEventListener('change', function () {
  // do something with the value
});
```

A model should let us listen for changes to its properties:

```javascript
model.on('change:selected', function (newValue) {
  // do something with the new value
});
```

In addition, models should contain the functionality that makes it easy for us to work with that data. That means things like exposing some processed form of the data should be a method on the model. Let's say one of the model properties represents a date. We may have a method on the model for getting a nicely formatted date string built from that date object. Arguably this is a presentation issue, but the model ends up being a logical place to expose a string version of the date property for maximum re-use and consistency.

In addition, models are a good place for methods that perform actions on the model itself like updating the server when the model changes.

In [And Bang](https://andbang.com), we do a lot with tasks. You can assign them to each other, "ship" them, "later" them, "trash" them, etc.

So, each of these actions are represented by a method on the task model that sends the correct data to the server as well as updating the appropriate properties on the local model. 

For example, here's the `trash` method of a task in And Bang:


```javascript
...
},
trash: function () {
  if (this.deleteable) {
    this.removing = true;
    this.api('deleteTask');
  }
  return this.deleteable;
},
...

```

It includes an upfront check to see whether we even have permission to trash this item. In case you're wondering this isn't actually used to enforce this permission, that's the APIs job. 

In fact, that's worth a little tangent to drive home the purpose of an API. It's *always* the API's job to maintain its own data integrity. You shouldn't *ever* be able to do anything in the client code that puts your API data in a weird or broken state. For example, never leave it up to your client code to know that if you delete a list you also have to go delete all the items in the list. That's the APIs job.`</rant>`

Continuing... calling the `trash` method sets a local state property `removing` and then calls the API method that sends the command to the server to delete the task (in this case via websocket, but the transport is irrelevant).

But the cool thing is, that's *it*. That's all we have to do when we want to delete a widget. You simply have to look up that widget's model and call `.trash()`. 

Nowhere in this code do you see anything about removing the item from DOM.

That happens when we get confirmation from the API that the task was removed, it then is removed from the collection, which triggers a `remove` event on the collection and the view (which represents the DOM, as described in the next chapter) listens for `remove` events and plucks that list item out of the DOM. It may sound a bit complex, but only in that you have to describe all those relationships. Once you have it's beautifully simple. 

Assuming we've got a view that represents that model, the view would have a click handler like this:

```javascript
var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  // our events hash (explained in the next chapter)
  events: {
    'click .delete': 'handleDeleteClick'
  },
  // our handler simply calls "trash", nothing more
  handleDeleteClick: function () {
    this.model.trash();
  },
  ...
})
```


Alternately, you can simply open the JS console in your browser and type:

```javascript
> app.currentTeam.tasks.get('someId').trash();
```

And you'll see that everything still happens exactly the same as if you had clicked to delete. The task will be deleted on the server and removed from the DOM.


## Using models for everything

As the app becomes more complex the failure to store all state in one (and only one) place in your app will be the source of the sorts of bugs that drive you to give up development and take up gardening.

So, what do I mean by storing *all* the state in your app? It's quite easy. If you find yourself checking whether something has a class or not, and using that to determine a course of action, you're doing it wrong. 

There are two simple rules:

1. All input, whether from the user or from an API, *never* does anything other than call a method or update a property of your models.
2. Always use your models as the "source of truth" in your app. Never "look up" state information anywhere other than your models.



### Applying this approach to our widget example

Let's think about the data first, before we think about the behavior. These items in the list represent something. Let's model *that* before we think about how they'll be presented. Let's just make a collection of models representing the items in the list. 

`models/widgetCollection.js`

```javascript
var Backbone = require('backbone');
var WidgetModel = require('./models/widget')

// or main export from this module (just the collection)
module.exports = Backbone.Collection.extend({
  // specify the model type for this collection
  model: WidgetModel,
  // the RESTful API URL representing this resource
  url: '/widgets'
});
```

`models/widget.js`

```javascript
var HumanModel = require('human-model');


module.exports = HumanModel.define({
  // we give our model a type
  type: 'widget',
  // define properties, these are the ones
  // that live on the server-side
  props: {
    id: ['string', true],
    widgetType: ['string', true, 'dooDad']
  },
  // session properties are just like props but
  // exist for the purpose of storing client-side
  // state.
  session: {
    selected: ['boolean', true, false]
  }
});
```


At this point we can do something like this in our application launch code:


```javascript
var WidgetCollection = require('models/widgets');


// assume this is the app's entry point
module.exports = {
  blastoff: function () {
    // creating our one global that holds the app
    window.app = this;

    // attach our widget collection here
    this.widgets = new WidgetCollection();
    // assumes you've got things set up so 
    // this will do an AJAX (or some other type) call
    // and populate the collection.
    this.widgets.fetch();
  }
};
```

So now we've got a representation of that list of widgets that assumes nothing about how it's going to be used.

Stop for a second and think about what that does for us when requriements change or even when we go build a second application on the same API. Nearly *all* the model code will be re-usable with zero changes. It simply represents the state that is available in the API which is the same no matter what the interface looks like. 

Also, think about this in a team environment. Someone can be working on writing models and making sure they get the proper data populated from the API while someone is building the clientside router and page views that include and design "static" versions of page elements that will be rendered by models once the API is hooked up. Because they're all in seperate files you won't step on eachothers toes and merging the combined code in git won't result in any major merge conflicts. 

Just imagine the sort of impact this has for a team to be able to work in parallel and to write code that doesn't need to be thrown away the minute someone wants to change the layout of the app.

In fact, that the basic model layer and API synchronization can be created before we even have a final app design.


### Model alternatives

In order to provide observability, models generally provide some sort of event registration system and a way to set and get some "protected" attributes.

For a long time, I used Backbone models for everything. The code for them is quite simple and readable (YES!), they're flexible and easy to use. Also, I'm generally a big fan of Backbone's general principles and structure.

Yet, you'll notice the examples all use `HumanModel` but Backbone collections.

Despite my love for Backbone, a few things finally drove me to creating HumanModel:


#### 1. Readability

If the models are the core of our application (as they should be), someone should be able to open the code for the model and *read* what properties it stores and what types those properties have. This is *huge* for enabling people to jump in and contribute to a project.


#### 2. Derived properties

So often, the data you get from the server is not in the format you'll want to present it. The classic example is first and last name. Most likely they come as seperate fields from the API, but in reality, most places you're going to present a user's name in the app will be in the format: `firstName + ' ' + lastName`. In Backbone you'd perhaps create a method called `fullName()` that when called, returned that value to you. The annoying thing comes when you want to bind that value to some location in the DOM. You have to listen for changes to either `firstName` or `lastName` and then call the method again and put the result into the DOM. There are two things I don't like about this: 

1. It *feels* like `fullName` or even just `name` should just be accessible in the same way as first or last name. Why can't I just go `user.name`?

2. I want to be able to listen for changes in one place. So, instead of `model.on('change:firstName change:lastName', doSomething)` it seems like I should be able to just listen for changes to `change:name` and have the model be smart enough to know that if either first or last name changes, call that handler too. 


#### 3. Direct access to properties

In a large app, you work with models **a lot**. Having to call `get` and `set` everywhere is a bit less than ideal, IMO. EcmaScript 5 (a.k.a. the version of the JS spec available in modern browsers) allows for `getters` and `setters` which means you can actually process simple assignments. This is better illustrated with an example:

```javascript
// without getters/setters (Backbone Model)
model.set('firstName', 'Henrik');

// with getters/setters (HumanModel)
model.firstName = 'Henrik';
```

What do I mean? You can already set whatever properties you want directly on an object even without getter/setters, right?!

YES! But not in a way that can be observed.

Getters and setters allow us to trigger those `change` events even when properties are set directly:

```javascript
model.on('change:firstName', function () {
  console.log('firstName changed!'); 
});

// even when setting the attribute directly the callback 
// registered above would still be called.
model.firstName = 'Henrik';
```

Getters and setters give us enormous flexibility, which can be bad. For example, we can make a getter run whatever code we want and return anything whenever we access a property.

```javascript
trickyModel.firstName = 'Henrik';

console.log(trickyModel.firstName); 
// we can make this log out *whatever* the heck we want
// despite it appearing to just have been assigned above.
```

##### Quick note on how to use getters/setters

Be sure to read the warning below, but for those not familiar, it may be useful to have a bit of an explanation of how getters and setters are written. There are two syntax options.

The first is using the `get` and `set` operators directly to define those methods:

```js
var myObject: {
  _properties: {},
  get name () {
    return this._properties.name;
  },
  set name (value) {
    this._properties.name = value;
  }
}
```

The second is using `Object.defineProperty()`:

```js
var myObject = {
  _properties: {}
};

Object.defineProperty(myObject, "name", {
  get: function () {
    return this._properties.name;
  },
  set: function (value) {
    this._properties.name = value;
  }
});

// there's also a defineProperties (plural)
Object.defineProperties(myObject, {
  lastName: {
    get: function () { ... },
    set: function () { ... }
  },
  fullName: {
    get: function () { ... },
    set: function () { ... }
  }
})
```

##### Warning!

As you can imagine this power gives you a *lot* of rope to hang yourself with and thus, this capability should be used *very* cautiously.

Some argue, and I can see their point, that using this is too much magic. If that's how you feel. Luckily, in our happy modular world, you can just use plain Backbone models and for many simpler apps, I still do.

However, I happen to think that in the case of models getters/settings can actually make our code more fault tolerant and more readable. But, I *only* use them for model properties and only in predictable ways.


#### 4. Type enforcement

Javascript, the language is dynamically typed, which is awesome. But we've said we're making our models the *core* of the app. Knowing that a given property is a given type is quite useful for eliminating silly bugs and protecting ourselves. 

Let's compare the two with a simple user model. In Backbone there is no standard way to define a property. Instead, you simply set a value as if it exists and now it does. 

```javascript
// Backbone model, no definition needed
// there *is* no standard way to even
// define the properties it should store
var model = new Backbone.Model();

model.set({
  firstName: 'Henrik',
  lastName: 'Joreteg'
});

// now i can get those
model.get('firstName'); // logs out 'Henrik'
```

Simple, elegant, flexible. But, assuming I set these values in some view code somewhere in another part of a large app, how do I know what attributes I have available to me or what they're called?

If I'm hitting an API to get my data and using the resulting data to set attributes on models, I have two options for figuring out what data I'm storing and what data I have available to my views. I either inspect the request to know what properties I'm supposed to have or inspect it in the console at runtime to see what properties my model contains and what their names are. 

That doesn't seem very developer friendly. 

Just think how much information I'm missing:

1. What properties do I have?
2. What type of values do those properties contain?
3. Can I trust that this property will always contain a value?
4. Is this a property client state or data we got from the server?
5. When I go to update the model on the server, which properties should be sent? 
6. Is a property computed from other properties, if so, how do I keep it up to date?
7. Perhaps most importantly, where do I go to find the answers to the questions above?


Sure the following example is silly, but what if I write some stupid code (as we do sometimes, amirite humans?!).

```javascript
// there's nothing stopping you from setting 
// the firstName property to be a date object.
model.set('firstName', new Date());
```

Sure, you may be able to keep it all in your head to a point, but what about when a second developer comes and looks at that code? Or what happens when you come back to the code after 6 months (or even 2 weeks)? Where do you go to see how the app is structured? You have to go spelunking into views for answers.

I prefer that the model is the explicit documentation on what state is stored. 

See how this could be in HumanModel:

file: `models/user.js`

```javascript
var HumanModel = require('human-model');

module.exports = HumanModel.define({
  type: 'user',
  // our properties from the server
  props: {
    // here is the shorthand syntax for defining a property
    // first is type, second is required, last is default value
    firstName: ['string', true, ''],
    lastName: ['string', true, ''],
    // You can also be even more explicit
    // and pass and object
    middleName: {
      type: 'string',
      required: true,
      default: ''
    },
    // Or less specific the minimum 
    // you need is a type, for example:
    isAwesome: 'boolean'
  },
  // Session properties are defined and work exactly
  // the same way as properties. The difference is 
  // they're not sent to the server on save(), etc.
  session: {
    selected: ['boolean', true, false]
  },
  // Derived properties are getters constructed from
  // other information. (you cannot set a derived property, this is intentional)
  derived: {
    // the name of the derived property
    // in this case refrencing "model.fullName"
    // would give us the result of calling the
    // function below
    fullName: {
      // we specify which properties
      // this is dependent on (meaning if they change)
      // so does the derived property
      deps: ['firstName', 'lastName'],
      fn: function () {
        return (this.firstName + ' ' + this.lastName).trim();
      },
      // we can optionally cache the result, doing this
      // means it won't run the function to return the result
      // unless one of the dependency values has changed since 
      // the last time it was ran. This feature can lead to 
      // dramatic performance improvements over plain Backbone
      cache: true
    }
  }
});
```

file: `hypothetical_app.js`

```javascript
// grab our user definition from above
var User = require('./models/user');

// create an instance of that user model
var model = new User();

// I can now know that it's got a value for firstName
console.log(model.firstName); // prints: ''

// and it's a predictable type
console.log(typeof model.firstName); // prints: 'string'

// and we can't just set it to something else
model.firstName = ['hi']; // <- this won't work and will throw and error

// but we can set it as a string
model.firstName = 'Henrik';
console.log(model.firstName); // prints: 'Henrik'

// here's the *awesome* part I _can't_ set a property that isn't defined
// so if I fatfinger the property name, it won't stick.
// *Note what HumanModel does when calling `set()` with undeclared attributes
// can be configured. See human-model docs for more.
model.frstName = 'Henrik';
```

By enforcing this level of property definitions we always make sure that our models, which is the "backbone" of the app (*wink*), are readable pieces of code that help document how the app is put together.


#### 5. Better handling of lists/dates

Another argument for using getters/setters for models is that it makes it possible to observe change to properties that are Objects. At least when using things like arrays and dates as properties.

Since arrays and dates are Objects in JS, they're passed by reference.

So, what happens if we want to store a list of ids as a property of a user?

In Backbone, how would we get a `change` event?

```javascript
var model = new Backbone.Model();

model.set('ids', ['23', '25', '47']);

// if we want to get them and change them
var myIds = model.get('ids');

// if we now change it...
myIds.reverse();

// ...and set it back
model.set('ids', myIds);

// we would never get a change event from Backbone
```

If you understand javscript you'll realize this isn't a flaw in Backbone, it's just because javascript passes objects by reference. 

As a result, when Backbone gets the "set" event it just compares `this.get('ids') === newIds` which will always be true, because you're comparing the same object not a copy of it.

The same is true with dates. If you get a date object, call a method on it, like `setHours()` and set it back, you'd never get a change event. So you wouldn't know you need to update your view. 

We can solve this with getters/setters in cases where we *know* we want this behavior by forcing the model to always give us a new object when we access the property.


```javascript
var HumanModel = require('human-model');

// set up a simple model definition
var DemoModel = HumanModel.define({
  props: {
    ids: ['array', true, []]
  }
});


// then we use it
var model = new DemoModel();

// get our array
var arr = model.ids;

// modify it back
arr.push('something');

// this now triggers a change event
model.ids = arr;
```

### Summarizing models

Models should contain the following:

1. Properties that we get from the API
2. Properties that we need in order to track client state (selected, etc.)
3. Mechanisms for validating their own data integrity.
3. Methods we can call to update or delete corresponding models on the server.
4. Convenient accessors (a.k.a. derived properties) that describe or process the properties in some way to allow re-use.
5. Child collections (if applicable).

Models should *never* contain:

1. Anything that manipulates the DOM
2. Any DOM event handlers
