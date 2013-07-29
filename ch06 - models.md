# Models

## A simple example 

Let's say your has a list of items. When a user clicks on an item, you want to visually mark it as selected. Someone used to building simple apps would probably do something like this:

```js
// register a click handler on the parent list
$('ul.theList').delegate('click', 'li', function () {
    // toggle a class on the clicked item
    $(this).toggleClass('selected');
})
```

So now, clicking on an item will toggle a class. jQuery's `toggleClass()` method will check whether it's already got the class and add or remove it as necessary. Great! we're done!

Err... well typically if you're going to select something it's for a reason, right? So our app is going to want to *do* something with the selected item or items. 

Let's say the user has selected several things and now wants to delete them by clicking a delete button. No problem, you say, we just add a button handler that find the ones with the selected class and deletes them.

```js
$('button.delete').click(function () {
    // get our seleted dom items, loop through them
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

The "selected" state as described above is a good example of client-specific state, meaning when we go to update a widget in the API we're not going to send `{selected: true}` as one of its properties. The server doesn't care about that, it's just used to track the state of the user interface.

So, what is a model anyway? What does it give us?

The fundamental thing a model should provide is observability. What do I mean? Well, in the same way you can register an event listener in the browser that responds to a form input value changing:

```js
document.getElementById('myInput').addEventListener('change', function () {
    // do something with the value
});
```

A model should let us listen for changes to its properties:

```js
model.on('change:selected', function (newValue) {
    // do something with the new value
});
```

In addition, models should contain the functionality that makes it easy for us to work with that data. That means things like exposing some processed view of the data could be a method on the model. Let's say one of the model properties is a date. We may have a method on the model for getting a nicely formatted date string built from that date object. Arguably this is a presentation issue, but the model ends up being a logical place to expose a string version of the date property for maximum re-use and consistency.

In addition, models are a good place for methods that perform actions on the model like updating itself in the API, for example.

In And Bang, we do a lot with tasks. You can assign them to each other, "ship" them, "later" them, trash them, etc.

So, each of these actions are represented by a method on the task model that sends the correct data to the server as well as updating the appropriate properties on the local model. 

For example, here's the `trash` method of a task in And Bang:


```js
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

In fact, that's worth a little tangent to drive home the purpose of an API. It's *always* the API's job to maintain its own data integrity. You shouldn't *ever* be able to do anything in the client code that puts your API data in a weird or broken state. For example, never leave it up to your client code to know that if you delete a list you also have to go delete all the items in the list. That's the APIs job.</rant> 

Continuing... calling the `trash` method sets a local state property `removing` and then calls the API method that sends the command to the server to delete the task (in this case via websocket, but the transport is irrelevant).

But the cool thing is, that's *it*. That's all we have to do when we want to delete a widget. You simply have to look up that widget's model and call `.trash()`. 

Nowhere in this code do you see anything about removing the item from DOM.

That happens when we get confirmation from the API that the task was removed, it then is removed from the collection, which triggers a `remove` event on the collection and the view (which represents the DOM, as described in the next chapter) listens for `remove` events and plucks that list item out of the DOM. It may sound a bit complex, but only in that you have to describe all those relationships. Once you have it's beautifully simple. 

Assuming we've got a view that represents that model, the view would have a click handler like this:

```js
var StrictView = require('strictview');

module.exports = StrictView.extend({
    // our events hash (explained in the next chapter)
    events: {
        'click .delete': 'handleDeleteClick'
    },
    // our handler simply calls "trash", nothing more
    handleDeleteClick: function () {
        this.model.trash();
    }
})
```


Alternately, you can simply open the JS console in your browser and type:

```js
> app.currentTeam.tasks.get('someId').trash();
```

And you everything will still just happen. The task will be deleted on the server and removed from the DOM.


## Using models for everything

As the app becomes more complex the failure to store all state in one (and only one) place in your app will be the source of the sorts of bugs that drive you to give up development and take up gardening.

So, what do I mean by storing *all* the state in your app? It's quite easy. If you find yourself checking whether something has a class or not, and using that to determine a course of action, you're doing it wrong. 

There are two simple rules:

1. All input, whether from the user or from an API, *never* does anything other than call a method or update a property of your models.
2. Always use your models as the "source of truth" in your app. Never "look up" state information anywhere other than your models.



### Applying this approach

Let's think about the data first, before we think about the behavior. These items in the list represent something. Let's model *that* before we think about how they'll be presented. Let's just make a collection of models representing the items in the list. 

`models/widgetCollection.js`

```js
var Backbone = require('backbone');
var WidgetModel = require('./models/widget')

// or main export from this module (just the collection)
module.exports = Backbone.Collection.extend({
    // specify the model type for this collection
    model: WidgetModel,
    url: '/widgets'
});
```

`models/widget.js`

```js
var StrictModel = require('strictmodel');


module.exports = StrictModel.extend({
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


```js
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

Also, if we think about this in a team environment. Several people could be writing the various models without stepping on each other's toe, while yet others are building views that render HTML. When things come together in version control there aren't even significant merge conflicts because these are all in seperate files. 

Just imagine what sort of impact this has for a team to be able to work in parralel and to write code that doesn't need to be thrown away the minute someone wants to change the layout of the app.

In fact, that the model layer can be created before we even have a final app design.

