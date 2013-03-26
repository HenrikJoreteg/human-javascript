# Cleanliness in clientside JS

The single biggest challenge you’ll have when building complex clientside application is keeping your code base from becoming a garbled pile of mess.

If it’s a longer running project that you plan on maintaining and changing over time, it’s even harder. Features come and go. You’ll experiment with something only to find it’s not the right call. 

I write lots of single page apps and I absolutely *despise* messy code.  Here are a few techniques, crutches, coping mechanisms, and semi-pro tips for staying sane.

## Separating views and state
This is the biggest lesson I’ve learned building lots of single page apps. Your view (the DOM) should just be blind slave to the model state of your application. For this you could use any number of tools and frameworks. I’d recommend starting with [Backbone.js](http://backbonejs.org/) (by the awesome Mr. [@jashkenas](https://twitter.com/jashkenas) as it’s the easiest to understand, IMO. 

Essentially, you’ll build up a set of models and collections in memory in the browser. These models should be completely oblivious to how they’re used. Then you have views that listen for changes in the models and update the DOM. This could be a whole giant blog post in an of itself. But this core principal of separating your views and your application state is vital when building large apps.

## Common JS Modules
I’m not going to get into a debate about module styles and script loaders. But I can tell you this: I haven’t seen any cleaner, simpler mechanism for splitting your code into nice isolated chunks than Common JS modules.

It’s the same style/concept that is used in node.js. By following this style I get the additional benefit of being able to re-use modules written for the client on the server and vice versa.

If you’re unfamiliar with the Common JS modules style, your files end up looking something like this:

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

Of course, browsers don’t have support for these kinds of modules out of the box (there is no `window.require`). But, luckily that can be fixed. I use a clever little tool called [stitch](https://github.com/sstephenson/stitch) written by [Sam Stephenson](https://twitter.com/sstephenson) of 37signals. There’s also another one by [@substack](https://twitter.com/substack) called [browserify](https://github.com/substack/node-browserify) that lets you use a lot of the node.js utils on the client as well.

What they do is create a `require` function and bundle up a folder of modules into an app package.

Stitch is written for node.js but you could just as easily just use another server-side language and just use node to build your client package. Ultimately it’s just creating a single JS file and of course at that point you can just serve it like any other static file.

You set up Stitch in a simple express server like this:

    // require express and stitch
    var express = require('express'),
        stitch = require(‘stitch’);
    
    // define our stitch package
     var appPackage = stitch.createPackage({
        // you add the folders whose contents you want to be “require-able”
        paths: [
            __dirname + '/clientmodules',  // this is where i put my standalone modules
            __dirname + '/clientapp' // this is where i put my modules that compose the app
        ],
        // you can also include normal dependencies that are not written in the 
        // commonJS style
        dependencies: [
            somepath + '/jquery.js',
            somepath + '/bootstrap.js'
        ]
    });
    
    // init express
    var app = express.createServer();
    
    // define a path where you want your JS package to be server
    app.get(‘/myAwesomeApp.js’, appPackage.createServer());
    
    // start listening for requests
    app.listen(3000);

At this point you can just go to `http://localhost:3000/myAwesomeApp.js` in a browser and you should see your whole JS package.

This is handy while developing because you don’t have to re-start or recompile anything when you make changes to the files in your package.

Once you’re ready to go to production you can use the package and uglify JS to write a minified file to disk to be served staticly:

    var uglifyjs = require('uglify-js'),
        fs = require('fs');
    
    function uglify(code) {
        var ast = uglifyjs.parser.parse(code);
        ast = uglifyjs.uglify.ast_mangle(ast);
        ast = uglifyjs.uglify.ast_squeeze(ast);
        return uglifyjs.uglify.gen_code(ast);
    }
    
    // assuming `appPackage` is in scope of course, this is just a demo
    appPackage.compile(function (err, source) {
        fs.writeFileSync('build/myAwesomeApp.js', uglify(source));
    });

### Objection! It’s a huge single file, that’s going to load slow!
Two things. Don’t write a huge app with loads and loads of giant dependencies. Second, cache it! If you do your job right, your users will only download that file once and you can probably do it while they’re not even paying attention. If you’re clever you can even prime their cache by lazy-loading the app on the login screen, or some other such cleverness.

Not to mention, for single page apps, speed once your app has loaded is much more important than the time it takes to do the initial load.


## Code Linting
If you’re building large JS apps and not doing some form of static analysis on your code, you’re asking for trouble. It helps catch silly errors and forces code style consistency. Ideally, no one should be able to tell who wrote what part of your app. If you’re on a team, it should all be uniform within a project. How do you do that? We use a slick tool written by [Nathan LaFreniere](https://twitter.com/quitlahok) on our team called, simply, [precommit-hook](github.com/nathan-lafreniere/precommit-hook). So all we have to do is:

    npm install precommit-hook

What that will do is create a git pre-commit hook that uses JSHint to check your project for code style consistency before each commit. Once upon a time there was a tool called JSLint written by Mr. Crockford. Nowadays (love that silly word) there’s a less strict, more configurable version of the same project called [JSHint](http://www.jshint.com/). 

The neat thing about the npm version of JSHint is that if you run it from the command line it will look for a configuation file (.jshintrc) and an ignore file (.jshintignore) both of which the precommit hook will create for you if they don’t exist. You can use these files to configure JSHint to follow the code style rules that you’ve defined for the project. This means that you can now run `jshint .` at the root of your project and lint the entire thing to make sure it follows the code styles you’ve defined in the `.jshintrc` file. Awesome, right!?!

Our `.jshintrc` files usually looks something like this:

    {
        "asi": false,
        "expr": true,
        "loopfunc": true,
        "curly": false,
        "evil": true,
        "white": true,
        “undef": true,
        "predef": [
            "app",
            "$",
            "require",
            "__dirname",
            "process",
            "exports",
            "module"
        ]
    }

The awesome thing about this approach is that you can enforce consistency and that the rules for the project are contained and actually checked into the project repo itself. So if you decide to have a different set of rules for the next project, fine. It’s not a global setting it’s defined and set by whomever runs the project.

## Creating an `app` global
So what makes a module? Ideally, I’d suggest each module being in it’s own file and only exporting one piece of functionality. Only having a single export helps you keep clear what purpose the module has and keeps it focused on just that task. The goal is having lots of modules that do one thing really well and then your app just combines modules into a coherent story.

When I’m building an app, I intentionally have one main controller object of sorts. It’s attached to the window as “app” just for my own. For modules that I’ve written specifically for this app (stuff that’s in the clientapp folder) I allow myself the use of that global to perform app-level actions like navigating, etc. 

## Using events: Modules talking to modules
How do you keep your modules cleanly separated? Sometimes modules are dependant on other modules. How do you keep them loosely coupled? One good technique is triggering lots of events that can be used as hooks by other code. Many of the core components in node.js are extensions of EventEmitter the reason is that you can register handlers for stuff that happens to those items just like you can register a handler for someone clicking a link in the browser. This pattern is really useful when building re-usable compenents yourself. By exporting things that inherit from event emitters means that the code using your module can specify what they care about rather than the module having to know. For example, see the super simplified version of the And Bang js library below.

There are lots of implementations of event emitters. We use a modified version of one from the LearnBoost guys: [@tjholowaychuk](https://twitter.com/tjholowaychuk), [@rauchg](https://twitter.com/rauchg) and company. It’s [wildemitter](https://github.com/HenrikJoreteg/wildemitter) on my github if you’re curious. But the same concept works for any of the available emitters. See below:

    // require our emitter
    var Emitter = require(‘wildemitter’);
   
    // Our main constructor function
    var AndBang = function (config) {
        // extend with emitter
        Emitter.call(this);
    };

    // inherit from emitter
    AndBang.prototype = new Emitter();

	 // Other methods
    AndBang.prototype.setName = function (newName) {
        this.name = newName;
        // we can trigger arbitrary events
        // these are just hooks that other
        // code could chose to listen to.
        this.emit(‘nameChanged’, newName);
    };
    
    // export it to the world
    module.exports = AndBang;

Then, other code that wants to use this module can listen for events like so:

    var AndBang = require(‘andbang’),
        api = new AndBang();
    
    // now this handler will get called any time the event gets triggered
    api.on(‘nameChanged’,  function (newName) { /* do something cool */ });
    
This pattern makes it easy to expose functionality without having to know anything about the consuming code.

### More?
I’m tired of typing so that’s all for now. :)

But I just thought I’d share some of the tools, techniques and knowledge we’ve acquired through blood, sweat and mistakes. If you found it helpful, useful or if you want to yell at me. You can follow me on twitter: [@HenrikJoreteg](http://twitter.com/henrikjoreteg). 

See ya on the interwebs! Build cool stuff!