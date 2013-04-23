# The structure of the clienside application code

## Grab your Moonboots

We configure our clientside code using a helper called "moonboots" that manages your javascript files for the project. In `server.js` you'll see it configured like this:

```js
var clientApp = new ClientApp({
    
    // the directory where all the client code is stored
    dir: __dirname + '/clientapp',
    
    // Whether or not to build and serve cached/minified versions of 
    // the application file.
    // While you're in development mode you don't need to restart the
    // server or do anything other than edit clientside code in your project.
    // It also sets up a watcher on your templates directory so the 
    // clientside templates get recompiled and inserted into clientapp/modules.
    developmentMode: true,
    
    // these are the regular javascript files (not written in commonJS style) 
    // that we want to include in our application. These all live in clientapp/libraries
    // and will be concatenated in the order listed.
    libraries: [
        'jquery-1.9.1.js',
        'launch.js'
    ],
    
    // this tells the helper whether or not we want it to handle serving the minified static files
    serveStaticFiles: false,

    // we pass in the express app here so that we it can handle serving files during development
    server: app
});
```

At this point we can tell express the routes where we want it to serve our application. This is a bit hard to wrap your head around if you're not used to single page applications that do clientside routing. 

Because we're sending a javsacript application, rather than rendered HTML it's the client's job to read the URL and grab the appropriate data and render the appropriate page represented by that URL. But, obviously the browser is just going to send a request to our node server. So we have to tell it to respond with the same data on more than one url. 

You can do this in express through the use of wildcard handlers or by passing regular expressions instead of strings as the route definition. In this template you'll see the relevant line in server.js looks like this:

```js
app.get('*', csrf, clientApp.html());
```

Where `clientapp` is the app we defined above. Calling html() on it will return a request handler that serves up the base HTML for the application at all the relevant routes.

The reason for the wildcard url becomes more obvious in the sample application when you open it and click the first list item and it takes you to "/sample". When navigating to that page, the browser won't make any server requests, but you'll the URL change. However, now that you're viewing the "/sample" page if you refresh the browser, obviously the browser will make a request to "/sample". So if your server app isn't set up to serve the same response at that URL it won't work.

By simply having the helper provide a request handler, you can add whatever middleware you want first (as seen with CSRF in that example).


## The clientapp folder

The client app folder is the container for all of the code that is use in, you guessed it, our browser app.

It contains the following folders:

- .build (folder): this is where the built/minified js files are stored. We then tell express to to make this a public directory and serve its contents with very high max-age cache headers. 
- app (folder): this folder contains all the clientside code written specifically for this project. It contains the following subfolders and files:
    - helpers (folder): contains any utilities that are specific to this app. It provides a place to put code that you want to re-use in several places in the app without it necessarily being generic enough to be considered a standalone module. For example, you may have a generic way to parse incoming text and convert it to html. This type of thing may have specific rules for this app, but may still depend on some context from the app.
    - models (folder): contains definitions for all backbone models and collections. As a sanity check, none of these files should have anything related to dom elements or dom manipulation.
    - pages (folder): the pages folder is where we store the specialized backbone views that represent a page rendered at a specific URL.
    - views (folder): the views folder contains all our backbone views (that are not pages) so things like the main application view and views for rendering specific types of models, etc.
    - caa-mobile.js (file): this is the main entry point for our application. It creates an `app` global variable and instantiates the main models and views.
    - router.js (file): this is our clientside (backbone) router. It contains a list of url routes at the top and corresponding handlers, whose job it is to instantiate the right views with the right models and call `app.renderPage` with those values.

- libraries (folder): this contains all the libraries we're using that are *not* structure like CommonJS modules. So things like jquery and jquery plugins will go here. There is also a specific file called `launch.js` that is responsible for requiring and instantiating the main application itself. We do this so that we can just include a single script tag in our html.

- modules (folder): here is where we put all the generic clienside modules. This is where we put stuff like backbone (which is written to be "requireable") and underscore. It's also where we put our generic tools and helpers that we may have written for other projects. Stuff like query string parsers or other convenience functions. Anything in this folder will be requireable at the top level. For example, you can just to `var Backbone = require('backbone')` from any of your other modules. This folder also also where we put our compiled template file:
    - templates.js (file): this is the module that gets created from the templates folder (see next). It's a single file with a function for each clientside template. This file gets auto-generated so don't try to edit it directly. Putting it in here lets us also just require and use our template functions easily within our views. Each template has a corresponding template function. Each function takes your context object and just returns a string of html. 

- templates (folder): Here is where we keep all our jade files that get used in the client application. Any time you're wanting create html within the app, use a jade template and put it in here. You can structure this folder in whatever fashion that makes sense for your application. The important thing to understand is that folders become part of the template.js module structure. For example, in this template you'll see that there's a `pages` folder within the templates folder with a file called `home.jade`. To use that function that got created from that, you'd access it as follows: 

```js
var templates = require('templates');

// note that 'pages' becomes part of the structure of your
// imported templates object
var html = templates.pages.home();
```

- app.html (file): the app.html file is what actually gets served by express for any request that is to be handled by the clientside app. The filename of the app is the only variable. Having this name be dynamically generated (by hashing the source code) lets us create uniquely named (and thus aggressivly cacheable) minified files for serving during production. Since the name is generated from a hash of the source, that means the name of the file will change any time our app does.
