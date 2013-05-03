# Client or server? Go big or go home.

As someone who writes lots of javscript, you may think I’d advocate that everything should be a browser app. In short: No.

Make things as damn simple as you possibly can. Programming is complex, expensive and time consuming. Pragmatism is the only way to ever finish anything.

For many types of applications, building a browser app is harder and gives you no additional value. I do think there may be a day when that's no longer the case. But we're not there yet.

So, instead, think about how you want your app to be used. Is it something that a user is going to load once and leave sitting on their desktop all day? Or is it something that’s quickly referenced and then closed.

As engineers we over-engineer things ALL THE TIME. Just think how many blogs hit a database with each and every request when really they could just be static html generated from markdown or something (example: [jekyll](https://github.com/mojombo/jekyll)).

Building client-side apps is more complicated. So, decide carefully. Ask yourself, is there additional benefit your users will get? Are you building something that is opened and closed frequently or are you building an experience? How often does the data in the application change? Do you care if it changes while the app is open?


## So I didn’t talk you out of it? Ok, then go all out!

`<patronizing tone>` So you’ve heard of "seperation of concerns" `</patronizing tone>`. We’re taught to build tools and components that have a simple job and are self-contained. It makes code more re-usable and more maintainable and keeps developers more sane. 

HOWEVER, the first thing people do when building web apps is render a bunch of html on the server and then send it to the client and start shuffling it around with a bunch of javascript! 

Pick one or the other, seriously. If you’re building an "app" where a significant portion of the data will be rendered on the client, just freakin’ render *all* of it on the client. Don’t mess around. It’s just ugly to have send a bunch of partially rendered html to the client and then start mucking around with it. 

One of my favorite things to show developers from the And Bang code base is the HTML we send to the browser. Here it is... in its entirety as of this writing:

```html
<!DOCTYPE html>
<!-- served with <3, &yet -->
<script src="/&!.js"></script>
```

Yup. (and yes, omitting `<html>`, `<head>`, and `<body>` is allowed by the HTML specs)

In fact, I wish we could go even further. Just think if you could serve a JS file with a content-type of "application/javascript" and then the browser treated it as shown above?

Am I crazy? Probably. 

*But*, if we've decided that we want our server to be able to focus on data we may as well transfer as much of the rendering and presentation of client to the client. 

Ok, I’ll admit it, this extreme minimalism is, in part, because of the aesthetic of it. But, it also makes it abundantly clear that it's the client's responsibility to render the application and manage everything within it, including the page title and life-cycle of all the page elements.

Some devs advocate partial rendering on the server, for faster load times, etc. But, to me, once we recognize we're building a "thick" client. We may as well render it all there. Othewise if part our page state is rendered on the server we have to somehow re-translate the HTML into state information. Again, I prefer an explicit separation of concerns. In fact, I wish browsers would let us just serve the JS file with a content header of "javascript/application" and not include any HTML at all.

I can hear the screams now, "What about load times and performance?!?!" I'd rather optimize how my application runs once it's loaded, than shave miliseconds off the time required to download the initial app. Also, let’s keep in mind that the shiny, retina-ready logo or the the background texture images you used likely take up as much bandwidth as your entire application. Also, if your app is contained in a single file (more on that later) it’s fairly simple to version and cache the crap out of it so the browser only downloads it once per revision anyway. 

Also, if we’re pragmatic about this, we recognize that you’re probably going to render some kind of signup or login form at some point, if you’re sneaky, you could use the inevitable time the user is going to spend on that page to download the app so that when users actually reach your app they’ll have a primed cache!
