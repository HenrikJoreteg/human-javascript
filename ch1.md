# Apps vs. Websites

If you own a "smart" phone of any sort, you’ve been innundated with a new slangish word over the past 5 years or so: "app"

Rather than pontificate on the meaning of this for three chapters, I’ll summarize the distinction as I see it for the purposes of this book. 

When I’m referring to a "web app" within these pages, I’m talking about an application that:

1. That runs in a browser.
1. Is loaded once and never do a page reload while you’re using it.
1. Has "state" that is seperate from the server.

Here’s the additional trickery: once you acknowledge that the browser has state you really ought to think about how to keep that state up to date and make it a "realtime" application. But I digress. 

## Screw it, I’ll digress for a bit

The future of the web is realtime. Seriously. The reason I can say this with such certainty is because it's already happening under our noses.

Facebook, gmail, gtalk, github just to name a few, have all implemented some form of automatic page updating. When they have something new to tell you, they don't wait for you to ask for it. They push it out to you, from the server to the client.

In some cases this is as simple as the page automatically polling to see if there's something new. In other cases it's more advanced where all the data used to build and update the page is coming over an open websocket connection. For our purposes, the transport mechanism is largely irrelevant, the point is, data comes to you.

This inherently breaks the statelessness of webpages. It used to be that I hit a URL and got back a webpage. As a user I understood that the information on the page was accurate as of the time it was requested. If I wanted to check for something new, I'd go ask for it again and got another snapshot in time.

As soon as we make any effort to keep the information on the page in sync with the server, we've now acknowledged that the webpage has "state". The page always had state, but, when we as developers decide we want to do partial updates of the page, the only way we can do so is by knowing what we currently have and comparing it to the server. State duplication has occurred and we're now maintaining "state" in some form in the client.

As users get increasingly comfortable with that idea, we'll reach a point where always-current, self-updating information is the expectation rather than a surprise. I promise you, this will happen, whether you're on board or not. If you want to stay at the top of your field as a web developer, you'll have to know how to build apps that work this way.

When you duplicate state, you increase complexity. Because now, rather than worrying about just rendering some data correctly, you're now caring about staleness, caching, and merge conflicts.

If we step back a bit and look at what we're actually doing, we start to realize that we're actually building is a distributed system and we'll have all the same challenges that come with building distributed systems.

I know what you're probably thinking. Some framework is going to come along that solves this problem for me. You may be right, there are many different approaches to dealing with the problems of duplicated state. There are many frameworks such as Meteor.js, SocketStream, and Derby.js that aim to simplify the process of building apps that work this way.

The challenge with those frameworks, from where I sit, is that there's a lot of emphasis on trying to share code and logic between the client and the server when client/server really should be performing fundamentally different roles. Servers are for data, clients are for presentation. To me, this is just basic principle of seperation of concerns. From everything I've read and heard, the way you solve complex problems is by not solving complex problems. Instead, complex problems are solved by building small, maintainable pieces that tackle a small portion of the complex problem.

Why bring the complexity of the server to the client and vice/versa? In addition, when you try to share too much server code with a browser it's very easy to fall into the trap of tightly coupling your application to that particular client. This makes it much harder to build other clients, say for example a native iOS app for your app. So while these frameworks are useful for webapps, they may let us down a bit when we want to go beyond that. With more and more talk of "the Internet of things" we have good reason to believe that the breadth of device types that may want to talk to your app will continue to increase.

Let’s talk about the when to build an "app" and when to keep things simpler.