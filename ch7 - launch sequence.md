require('your_app').launch();

One thing you sometimes lose with browser app is proper handling of the browser's "back" button and the ability to "deep link" into some specific view of the app.

The good news is we don't actually have to make those tradeoffs. Through the clever use of Backbone's router and HTML5 push state browser apps can take over the world. Here's how it works...


## Same shit different URL

From the server perspecive, how do we actually "hand control of routing to the client". Ugh... that's not how the web works, right? The server has to answer actual http GET request when a user types your app's url in their browser.

So what I mean is simply that you return the same app html at multiple urls.

For example, it doesn't matter if you hit:

https://andbang.com/andyet/chat

or 

https://andbang.com/basecamp

Either way, the server will return this html:

    <!DOCTYPE html>
    <script src="/&!.js"></script>


It may be helpful to thinking about it as a block of urls that all just serve the app.

If you're using express and node it's quite easy to do.

    app.get('/other/thing', function () {
        // you could still serve other support pages 
        // and simple things at specific urls.
    });

    // but then you want some sort of catch all that matches
    // the range of URLs you're going to want the single page app
    // to be available at:
    app.get('*', function (req, res) {
        res.sendFile('sameShit.html');
    });

At this point finding/fetching the right data and rendering the right view is up to the browser app.


## How to deal with clientside routes

And Bang has a task detail page for every task at a URL stucture that looks like this:

https://andbang.com/andyet/tasks/47

So, if a user types that URL in their browser the user will see a detail view of that task. Also, if they're somewhere else in the app and navigate to that task view by clicking the task in their list, the page won't reload, but when you look at the URL bar in the browser, that's the page you're on.

Backbone's router is really handy for handling all of that stuff. 

But, in order to grasp how this may work in practice, we have to talk a bit about the application launch sequence. 


## 3... 2... 1... Blastoff!

Generally there's going to be a fairly specific load sequence you'll want to go through before you're ready to "respond" to the specific URL in your client code. 

Typically, that sequence goes something like this:

- Init your main application object. (The "app" global I keep talking about.)
- Attach a few model collections to that app global.
- Init and populate a single "me" object that represents the currently logged in user and stores session specifc state.
- Render the application layout view inside the <body> tag.
- Fetch any app-wide data that's needed.
- Then trigger the clientside router


Now in code:

    module.exports = {
        // the main launch function this is the 
        // entry point into your application.
        launch: function () {
            // explicitly create a global called "app"
            // doing this first means it *always* exists
            // if we need to access it from a view.
            window.app = this;

            // Attach some model collections
            this.tasks = new Tasks();
            this.chatMessages = new Messages();

            // Init a 'me' object
            window.me = new Me();

            this.fetchStandardData(function (err) {
                if (err) {
                    // handle errors;
                }
                // render the main viev
                app.view = new MainView({
                    model: me
                }).render();

                // start our router
                // init our URL handlers and the history tracker
                new Router();
                app.history = Backbone.history;
                // we have what we need, we can now start our router and show the appropriate page
                app.history.start({pushState: true, root: '/'});
            });

        },
        fetchStandardData: function (mainCallback) {
            var self = this;
            async.parallel([
                function (cb) {
                    self.tasks.fetch({success: cb});
                },
                function (cb) {
                    me.fetch({success: cb});
                } 
            ], mainCallback);
        }
    }


As you can tell there's a handful things we do regardless of the URL. Once we've got that sorted is when we init our router and start our history tracking (which enables back-button support). 

The client router looks something like this:

    var Backbone = require('backbone');

    module.exports = Backbone.Router.extend({
        routes: {
            ':slug/:slug/tasks': 'member',
            ':slug/task/:taskid': 'memberTaskDetail',
            ...
        },

        // ------- ROUTE HANDLERS ---------
        home: function () {
            app.navigate(app.teams.first().chatUrl);
        },

        memberTaskDetail: function () {
            var View = require('pages/taskDetail'),
                team = this.getTeam(teamSlug);

            if (!team) return this.fourOhFour();

            // we may or may not have the task, so we just pass it in and try to get it from the view.
            app.renderPage(new View({
                team: team,
                taskId: taskId
            }));
        }
    }


So, each of the routes listed at the top are turned into regex's by backbone and linked to a handler function.

That function is called with the "arguments" a.k.a. paramaters you specified as being dynamic in your routes.

I typically think of each handler's job as being to find actual client-side model objects and then create a "page" view that it passes to the application.

The app is responsible for taking that view and rendering it per conventions of the app. Usually we just have a "page view" be a specialized kind of backbone view that also has a few standard methods for "show" and "hide". The app controller just calls "show" on the new one and "hide" on the currently active page and the views add/remove themselves from the application layout's main "pages" container.

The cool thing is that from this point on. We never do the launch sequene again. From this point, we just change the route and the route handlers do all the work and it's up to the rendered page view to do the work of loading what they need to.
