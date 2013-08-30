# Client routing (if there is such a thing)

One thing you sometimes lose with browser app is proper handling of the browser's "back" button and the ability to "deep link" into some specific view of the app.

The good news is we don't actually have to make those tradeoffs. Through the clever use of Backbone's router and HTML5 push state browser apps can take over the world. Here's how it works...



## Same sh*t different URL

From the server perspecive, how do we actually "hand control of routing to the client". Ugh... that's not how the web works, right? The server has to answer actual http GET request when a user types your app's url in their browser.

So what I mean is simply that you return the same app HTML at multiple urls.

For example, it doesn't matter if you hit:

https://andbang.com/andyet/chat

or 

https://andbang.com/basecamp

Either way, the server will return this HTML:

```html
<!DOCTYPE html>
<script src="/&!.js"></script>
```


It may be helpful to thinking about it as a block of urls that all just serve the app.

If you're using express and node it's quite easy to do.

```javascript
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
```

At this point finding/fetching the right data and rendering the right view is up to the browser app.


## How to deal with clientside routes

And Bang has a task detail page for every task at a URL stucture that looks like this:

https://andbang.com/andyet/tasks/47

So, if a user types that URL in their browser the user will see a detail view of that task. Also, if they're somewhere else in the app and navigate to that task view by clicking the task in their list, the page won't reload, but when you look at the URL bar in the browser, that's the page you're on.

Backbone's router is really handy for handling all of that stuff. 

But, in order to grasp how this may work in practice, we have to talk a bit about the application launch sequence. 
