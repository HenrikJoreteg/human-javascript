# No more clientside spaghetti. Organizing your code. 

The single biggest challenge you'll have when building complex clientside applications is keeping your codebase from becoming a garbled pile of mess.

If it's a long-running project that you plan on maintaining and changing over time, it's even harder. Features come and go. You'll experiment with something, only to find it's not the right call and leave traces of old code sprinked throughout.

I absolutely *despise* messy code. It's hard to read, hard to maintain, hard to collaborate on, and it's just plain ugly to look at. Beyond those pragmatic reasons, I consider my code to be my craft. Therefore, I want the care that I put into writing it to be obvious to those who read it.

Complexity sneaks up on you. If you don't actively fight for simplicity in software, complexity will win.

Here are a few techniques, crutches, coping mechanisms, and semi-pro tips for staying sane.

## Refactor early, refactor often

Entropy is inevitable in a codebase. If we don't continually modify, simplify and unify the existing code along with the new code that's being written, we can easily end up with a really big, messy app.

Some developers seem hesitant to touch code they've already written. But, I believe that deleting and updating code is a regular and important part of building an app. When you first start building an app, you don't know how you're going to build everything in it so there's no reason to treat any of the code you build along the way as infallible.

Code is just text, not an edict. It can be changed easily and should be streamlined as you build. 

Don't be scared of refactoring. Be scared of building an unmaintainable piece of crap. I have found that to be much more costly in the long run. Additionally, if your app is separated into clean simple modules the risk of accidentally breaking something else is dramatically lower.


## Separating views and state

This is the biggest lesson I've learned building lots of single page apps. Your view (the DOM) should just be blind slave to the model state of your application. For this you could use any number of tools and frameworks. I'd recommend starting with [Backbone.js](http://backbonejs.org/) (by the awesome Mr. [@jashkenas](https://twitter.com/jashkenas) as it's the easiest to understand, and the closest thing to "just JavaScript"™ as discussed in the introduction. 

Essentially, you'll populate a set of models and collections of these models in memory in the browser. These will store all the application state for your app. These models should be completely oblivious to how they're used; they merely store state and broadcast their changes. Then you will have views that listen for changes in the models and update the DOM. This core principle of separating your views and your application state is vital when building large apps.

One aspect of this approach that is commonly overlooked is the flexibility it provides if you decide the app should have a different UI (which *never* happens, right?! `</sarcasm>`), or if you build another application on the same API. All of the models pretty much without modification are completely reusable.


## CommonJS Modules

I'm not going to get into a debate about module styles and script loaders. But I can tell you this: I haven't seen any cleaner, simpler mechanism for splitting your code into nice isolated chunks than CommonJS modules.

Let's pause for just a second to discuss what modules do for us. JavaScript has globals. What I mean is that if you don't put a `var` in front of any variable declaration, you've just created a global variable that's accessible from *any* other code in your app. While this *can* be used for good, but also gives you a lot of rope to hang yourself with. Without a way of managing this, as your app grows, knowing what global variables you have at what time will become nearly impossible and will likely be a big source of bugs. We also want to build our app in tiny pieces of independent code (a.k.a. modules). So, how do we make sure each module has access to what it needs? By not referencing globals and by having each module explicitly `require` other code that it needs. That's why we need a module system. Very few things will have a greater positive impact on your code structure than switching to a good module system.

CommonJS is the same style/concept that is used in node.js. By following this style you get the additional benefit of being able to reuse modules written for the client on the server and vice versa (though, the overlap is usually not that big).

If you're unfamiliar with the CommonJS modules style, your files end up looking something like this:

```javascript
// you import things by using the special `require` function and you can
// assign the result to a variable
var HumanModel = require('human-model');
var _ = require('underscore');
  
// you expose functionality to other modules by declaring your main export
// like this.
module.exports = HumanModel.define({
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

Of course, browsers don't have support for these kinds of modules out of the box (there is no `window.require`). But, luckily that can be fixed. We use a clever little tool called [browserify](https://github.com/substack/node-browserify) that lets you `require` whatever modules you need. This also includes being able to declare dependencies in a `package.json` file and just installing `require()`-able modules from npm into your project. With this approach, no clientside specific package management like Bower is required. You simply declare your dependencies in your package file and install them.

Browserify will create a `require` system and starting with the module you specify as an entry point it will include each `require`-ed piece of code into an app package that can be sent to the browser.

Browserify is written for node.js but even if you're using something else to build your web app, you can use node and Browserify to build your client package. Ultimately, you're just creating a single JS file. So once it's generated, that file can be served just like any other static file by any file server you want.


## Grab your moonboots

If you're used to building apps where each script in your app directory has a corresponding `<script>` tag hardcoded in some HTML file somewhere it can be a bit confusing when switching to using a script module system like Browserify.

As I touched on in Chapter 2, we really would like our production environment to serve a single, minified, `.js` file with a unique file name so that we can tell browsers to cache it forever. However, that's far from ideal in a development environment because we don't want to debug minified code in the browser or have to rebuild it with every change. So, in the interest of keeping the development cycle enjoyable here's what we want:

1. Easy way to edit/refresh your clientside JavaScript files without having to restart the server or re-compile anything manually.
2. Be able to easily map code in your browser to the right file and line number in the non-compiled version in your app folder.
3. Serve unminified code in development.
4. In production, serve a minfied, uniquely named, permanently cachable file containing your entire app.
5. Be able to toggle between those two states with a simple config flag.
6. Be able to use Browserify for all compatible modules, but still be able to bundle other libraries into our app file.
7. Be able to serve/minify/cache CSS in the same way. 

Since defining this type of browser app "package" is such a common problem that we want for all apps, I built a helper to make it a bit easier to work with.

It's called "moonboots." To use it, you define your browser app like this (assuming node.js and express):

```javascript
var Moonboots = require('moonboots');


var clientapp = new Moonboots({
  // the directory where all the client code is stored
  main: __dirname + '/clientapp/main.js',

  // Whether or not to build and serve cached/minified version of 
  // the application file.
  // While you're in development mode you don't need to restart the
  // server or do anything other than edit clientside code in your project.
  developmentMode: true,

  // these are the regular JavaScript files (not written in commonJS style) 
  // that we want to include in our application. These all live in clientapp/libraries
  // and will be concatenated in the order listed.
  libraries: [
    __dirname + '/libs/jquery-1.9.1.js',
    __dirname + '/libs/jquery.plugin.js'
  ],

  // These are our stylesheets. They will be concatenated and run through
  // cssmin to minify them.
  stylesheets: [
    __dirname + '/public/css/styles.css'
  ],

  // we pass in the express app here so that it can handle serving files during development
  server: app
});
```


At this point we can tell Express the routes where we want it to serve our application. This is a bit hard to wrap your head around if you're not used to single page applications that do clientside routing.

Since we're sending a JavaScript application, rather than rendered HTML to the browser, it's going to be up to the client to read the URL, grab the appropriate data, and render the appropriate page represented by that URL. So it's up to us to configure our server to always respond with the same HTML at any URL that is considered part of our client application. We cover the concept of clientside routing in a bit more detail in Chapter 9.

You can do this in Express through the use of wildcard handlers, or by passing regular expressions instead of strings as the route definition. If you look at the sample application (https://github.com/HenrikJoreteg/humanjs-sample-app) you'll see the relevant line in server.js looks like this:

```javascript
app.get('*', csrf, clientapp.html());
```

Where `clientapp` is the app we defined above. Calling `html()` on it will return a request handler that serves up the base HTML for the application at all the relevant routes. By simply having the helper provide a request handler, you can still add whatever middleware you want first (as seen with CSRF in that example).

The need for the wildcard URL becomes more obvious in your application when you open it and navigate to a different URL within an app that uses HTML5 push state. Say we click a button that takes us to `/sample` within the app. When navigating to that page, the browser won't make any server requests, but you'll see the URL change. However, now that you're viewing the `/sample` page, if you refresh the browser, the browser will make a request to `/sample.` So if your server app isn't set up to serve the same response at that URL, it won't work.


### A note on going to production

Node happens to be pretty good at serving static files. So just serving the production file with node/moonboots is probably sufficient for most apps with moderate traffic. In production mode, moonboots will build and serve the app file from memory with aggressive cache headers. 

However, a lot of people like to serve static files with a separate process, using nginx or using a CDN etc. In that scenario, you can use Moonboots during development and then generate the minified file, write it to disk, or put it on something like an S3 as part of your deploy process.

Calling `moonboots.sourceCode(function (source) { ... })` will call your callback with the generated source code based on current config, which you could use to write it to disk or put it on a CDN as part of a grunt task or whatnot. Those details are probably beyond the scope of this book. But, the point is, you can certainly do that with these tools if that makes more sense for your app.


### The structure of the clientapp folder

Our clientapp folder usually contains the following folders:

- models (folder): Contains definitions for all backbone models and collections. As a sanity check, none of these files should have anything related to DOM elements or DOM manipulation.

- pages (folder): The pages folder is where we store the specialized Backbone views that represent a page rendered at a specific URL.

- views (folder): The views folder contains all of our Backbone views (that are not pages), so things like the main application view and views for rendering specific types of models, etc.

- app.js (file): This is the main entry point for our application. It creates an `app` global variable and instantiates the main models and views.

- router.js (file): This is our clientside (Backbone) router. It contains a list of URL routes at the top and corresponding handlers, whose job it is to instantiate the right views with the right models and call `app.renderPage` with those values.

- libraries (folder): This contains all the libraries we're using that are *not* structured like CommonJS modules. So things like jQuery and jQuery plugins will go here.

- modules (folder): Here is where we put all the clientside modules that we want to be able to require without a relative path. This is a good place to put our compiled template file:
    
    - templates.js (file): This is the module that gets created from the templates folder (see next). It's a single file with a function for each clientside template. This file gets auto-generated so don't try to edit it directly. Putting it in here lets us also require and use our template functions easily within our views. Each template has a corresponding template function. Each function takes your context object and returns just a string of HTML. 

- templates (folder): Here is where we keep all our Jade files that get used in the client application. Anytime you're wanting to create HTML within the app, use a Jade template and put it in here. You can structure this folder in whatever fashion makes sense for your application. The important thing to understand is that folders become part of the template.js module structure. For example, in this template you'll see that there's a `pages` folder within the templates folder with a file called `home.jade`. To use the function that got created from that, you'd access it as follows: 

```javascript
var templates = require('templates');

// note that 'pages' becomes part of the structure of your
// imported templates object
var html = templates.pages.home();
```

See Chapter 8 for a more in-depth discussion of templating.


## Creating an `app` global

So what makes a module? Ideally, I'd suggest each module being in its own file and only exporting one piece of functionality. Only having a single export helps you keep clear what purpose the module has and keeps it focused on just that task. The goal is having lots of modules that do one thing really well so that your app combines modules into a coherent story.

When I'm building an app, I intentionally have one main controller object of sorts. It's attached to the window as `app` just for convenience. For modules that I've written specifically for this app (stuff that's in the clientapp folder) I allow myself the use of that one global to perform app-level actions like navigating, etc.

The main app object doesn't really need to be all that special. Often I create an object literal with a main init function (more on that in Chapter 10). But generally it will look like this:

```javascript
module.exports = {
  // main init function
  blastoff: function () { 
    // attach our app object to the window
    window.app = this;
    // This is where we render our main view, get some data,
    // kick off the history tracking, etc.
    // See Chapter 10 for more detail
    ... 
  },

  // render a page view passed by the router
  renderPage: function () { ... }

  // alias to Backbone.history object so we can
  // do app.navigate('/someother/page') from 
  // anywhere in the app.
  navigate: function (url) {
    app.history.navigate(url, true);
  }
};

// run our whole app, it all starts here:
module.exports.blastoff();
```


Note that very last line that actually calls the `blastoff()` function. That's how we kick off the whole thing. That's our main entry point to the app.
