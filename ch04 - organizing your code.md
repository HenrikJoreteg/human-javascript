# No more clientside spaghetti. Organizing your code. 

The single biggest challenge you’ll have when building complex clientside applications is keeping your code base from becoming a garbled pile of mess.

If it’s a long-running project that you plan on maintaining and changing over time, it’s even harder. Features come and go. You’ll experiment with something, only to find it’s not the right call and leave traces of old code sprinked throughout.

I absolutely *despise* messy code. Here are a few techniques, crutches, coping mechanisms, and semi-pro tips for staying sane.


## Separating views and state
This is the biggest lesson I’ve learned building lots of single page apps. Your view (the DOM) should just be blind slave to the model state of your application. For this you could use any number of tools and frameworks. I’d recommend starting with [Backbone.js](http://backbonejs.org/) (by the awesome Mr. [@jashkenas](https://twitter.com/jashkenas) as it’s the easiest to understand, and the closest thing to "just javascript"™ as discussed in the introduction. 

Essentially, you’ll populate a set of models and collections of these models in memory in the browser. These will store all the application state for your app. These models should be completely oblivious to how they’re used; they merely store state and broadcast their changes. Then you will have views that listen for changes in the models and update the DOM. This core principle of separating your views and your application state is vital when building large apps.

One aspect of this approach that is commonly overlooked is the flexibility it provides if you decide the app should have a different UI (which *never* happens, right?! `</sarcasm>`), or if you build another application on the same API. All of the models pretty much without modification are completely reusable.


## Common JS Modules
I’m not going to get into a debate about module styles and script loaders. But I can tell you this: I haven’t seen any cleaner, simpler mechanism for splitting your code into nice isolated chunks than CommonJS modules.

CommonJS is the same style/concept that is used in node.js. By following this style you get the additional benefit of being able to reuse modules written for the client on the server and vice versa (though, the overlap is usually not that big).

If you’re unfamiliar with the CommonJS modules style, your files end up looking something like this:

```javascript
// you import things by using the special `require` function and you can
// assign the result to a variable
var StrictModel = require('strictModel'),
    _ = require('underscore');
    
// you expose functionality to other modules by declaring your main export
// like this.
module.exports = StrictModel.extend({
    type: 'navItem',
    props: {
        active: ['boolean', true, false],
        url: ['string', true, ''],
        position: ['number', true, 200]
    },
    init: function () {
        // some, something
    }
});
```

That's it! Super easy. You don't create any globals. Each file that uses your module can name it whatever makes the most sense for use in that module.

You just export a constructor (like above), or a single function, or even a set of functions. Generally, however, I'd encourage you to export only one thing from each module.

Of course, browsers don’t have support for these kinds of modules out of the box (there is no `window.require`). But, luckily that can be fixed. We use a clever little tool called [browserify](https://github.com/substack/node-browserify) that lets you use a lot of the node.js utils on the client as well.

What they do is create a `require` function and bundle up a folder of modules into an app package.

Browserify is written for node.js but you could just as easily use another server-side language and just use node to build your client package. Ultimately, you're creating a single JS file and of course, once generated, that file can be served just like any other static file.


## Grab your moonboots

Since defining a browser app "package" and then wanting to build, minify, and serve the resulting file is such a common problem that we want for all apps, I built a helper to make it a bit easier to work with.

It's called "moonboots." To use it, you define your browser app like this (assuming node.js and express):

```javascript
var Moonboots = require('moonboots');


var browserApp = new Moonboots({
    // the directory where all the client code is stored
    main: __dirname + '/clientapp/main.js',

    // Whether or not to build and serve cached/minified version of 
    // the application file.
    // While you're in development mode you don't need to restart the
    // server or do anything other than edit clientside code in your project.
    developmentMode: true,

    // these are the regular javascript files (not written in commonJS style) 
    // that we want to include in our application. These all live in browserApp/libraries
    // and will be concatenated in the order listed.
    libraries: [
        __dirname + '/libs/jquery-1.9.1.js',
        __dirname + '/libs/jquery.plugin.js'
    ],

    // we pass in the express app here so that we it can handle serving files during development
    server: app
});
```


At this point we can tell express the routes where we want it to serve our application. This is a bit hard to wrap your head around if you're not used to single page applications that do clientside routing.

Because we're sending a javascript application, rather than rendered HTML to the browser, it's the client's job to read the URL, grab the appropriate data, and render the appropriate page represented by that URL. Obviously the browser is just going to send a request to our node server. So we have to tell it to respond with the same html on more than one url.

You can do this in express through the use of wildcard handlers, or by passing regular expressions instead of strings as the route definition. In this template you'll see the relevant line in server.js looks like this:

```javascript
app.get('*', csrf, browserApp.html());
```

Where browserApp is the app we defined above. Calling html() on it will return a request handler that serves up the base HTML for the application at all the relevant routes.

The reason for the wildcard url becomes more obvious in your application when you open it and navigate to a different url within the app with an html5 push state. Say we click a button that takes us to "/sample" within the app. When navigating to that page, the browser won't make any server requests, but you'll see the URL change. However, now that you're viewing the "/sample" page, if you refresh the browser, obviously the browser will make a request to "/sample." So if your server app isn't set up to serve the same response at that URL, it won't work.

By simply having the helper provide a request handler, you can add whatever middleware you want first (as seen with CSRF in that example).


### The structure of the browserApp folder

Our browserApp folder usually contains the following folders:

- models (folder): Contains definitions for all backbone models and collections. As a sanity check, none of these files should have anything related to dom elements or dom manipulation.
- pages (folder): The pages folder is where we store the specialized backbone views that represent a page rendered at a specific URL.
- views (folder): The views folder contains all of our backbone views (that are not pages), so things like the main application view and views for rendering specific types of models, etc.
- app.js (file): This is the main entry point for our application. It creates an `app` global variable and instantiates the main models and views.
- router.js (file): This is our clientside (backbone) router. It contains a list of url routes at the top and corresponding handlers, whose job it is to instantiate the right views with the right models and call `app.renderPage` with those values.

- libraries (folder): This contains all the libraries we're using that are *not* structured like CommonJS modules. So things like jquery and jquery plugins will go here. There is also a specific file called `launch.js` that is responsible for requiring and instantiating the main application itself. We do this so that we can just include a single script tag in our html. Otherwise we'd have to extend our base HTML to also have a script tag that ran: `window.app = require('application').launch();`

- modules (folder): Here is where we put all the clientside modules that we want to be able to require without a relative path. This is a good place to put our compiled template file:
    - templates.js (file): This is the module that gets created from the templates folder (see next). It's a single file with a function for each clientside template. This file gets auto-generated so don't try to edit it directly. Putting it in here lets us also require and use our template functions easily within our views. Each template has a corresponding template function. Each function takes your context object and returns just a string of html. 

- templates (folder): Here is where we keep all our jade files that get used in the client application. Anytime you're wanting to create html within the app, use a jade template and put it in here. You can structure this folder in whatever fashion that makes sense for your application. The important thing to understand is that folders become part of the template.js module structure. For example, in this template you'll see that there's a `pages` folder within the templates folder with a file called `home.jade`. To use the function that got created from that, you'd access it as follows: 

```javascript
var templates = require('templates');

// note that 'pages' becomes part of the structure of your
// imported templates object
var html = templates.pages.home();
```


## Creating an `app` global
So what makes a module? Ideally, I’d suggest each module being in its own file and only exporting one piece of functionality. Only having a single export helps you keep clear what purpose the module has and keeps it focused on just that task. The goal is having lots of modules that do one thing really well so that your app combines modules into a coherent story.

When I’m building an app, I intentionally have one main controller object of sorts. It’s attached to the window as “app” just for my own. For modules that I’ve written specifically for this app (stuff that’s in the clientapp folder) I allow myself the use of that global to perform app-level actions like navigating, etc. 
