# 3... 2... 1... Blastoff!

Generally there's going to be a fairly specific load sequence you'll want to go through before you're ready to "respond" to the specific URL in your client code. 

Typically, that sequence goes something like this:

- Init your main application object. (The "app" global I keep talking about.)
- Attach a few model collections to that app global.
- Init and populate a single "me" object that represents the currently logged in user and stores session specifc state.
- Render the application layout view inside the `<body>` tag.
- Fetch any app-wide data that's needed.
- Then trigger the clientside router


Now in code:

```javascript
module.exports = {
  // The main launch function. This is the 
  // entry point into your application.
  launch: function () {
    // Explicitly create a global called "app."
    // Doing this first means it *always* exists
    // if we need to access it from a view.
    window.app = this;

    // Attach some model collections
    this.tasks = new Tasks();
    this.chatMessages = new Messages();

    // Init a 'me' object
    window.me = new Me();

    this.fetchStandardData(function (err) {
      if (err) {
        // Handle errors
      }
      // render the main viev
      app.view = new MainView({
        model: me
      }).render();

      // Start our router.
      // Init our URL handlers and the history tracker
      new Router();
      app.history = Backbone.history;
      // We have what we need, we can now start our router and show the appropriate page
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
```


As you can tell there's a handful of things we do regardless of the URL. Once we've got that sorted, then we init our router and start our history tracking (which enables back-button support). 

The client router looks something like this:

```javascript
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

    // We may or may not have the task, so we just pass it in and try to get it from the view.
    app.renderPage(new View({
      team: team,
      taskId: taskId
    }));
  }
}
```


So, each of the routes listed at the top are turned into regexes by Backbone and linked to a handler function.

That function is called with the "arguments," a.k.a. parameters you specified as being dynamic in your routes.

I typically think of each handler's job as finding actual clientside model objects and then creating a "page" view that it passes to the application.

The app is responsible for taking that view and rendering it per conventions of the app. Usually we just have a "page view" be a specialized kind of Backbone view that also has a few standard methods for "show" and "hide." The app controller just calls "show" on the new one and "hide" on the currently active page, and the views add/remove themselves from the application layout's main "pages" container.

From this point forward we never need to do the launch sequence again. We'll just change the route, then the route handlers will render the appropriate page, and the page will ensure it has (or fetches) the data it needs.
