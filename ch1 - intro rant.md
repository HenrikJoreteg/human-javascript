# This isn’t a javascript book

Yup, if that’s what you were expecting. Request a refund now. This isn’t about language syntax, it’s not about the 4 ways to execute a function, it’s not about introducing you to twelve available client frameworks. This is about how *we* build apps at &yet. 

It’s descriptive, not prescriptive. How you build is up to you. The hope is that we can introduce enough concepts, tools and philosophy to brainwash you to blindly follow our way of thinking :)

# Client Apps

If you own a "smart" phone of any sort, you’ve been innundated with a new slangish word over the past 5 years or so: "app"

Rather than pontificate on the meaning of this for three chapters, I’ll summarize the distinction as I see it for the purposes of this book. 

Most people say they're building a "web app" they're talking about writing source code that describes an application that will run on the server and send rendered HTML to the browser.

What I'm talking about in this book could really be called "browser apps". The destinction being that the source code itself is sent to the browser rather than the output. So these apps actually "run" in the browser instead of on a server.

To clarify further, the app:

1. We send the application code itself to the browser, not the result of running the application code.
1. The client fetches it's own data in a data format (typically JSON), not as html.
1. The app is loaded once and never does a full page reload while you’re using it.
1. Has "state" that is maintained seperate from the server.

From now on, when I say "app" or "browser app" or "client app" within these pages, that is what I'm referring to.

Here’s the additional trickery: once you acknowledge that the browser has state you really ought to think about how to keep that state up to date and make it a "realtime" application. But I digress. 

## Screw it, I’ll digress for a bit. This is imporant.

The future of the web is realtime. No doubt. The reason I can say this with such certainty is because it's already happening under our noses.

Facebook, gmail, gtalk, github just to name a few, have all implemented some form of automatic page updating. When they have something new to tell you, they don't wait for you to ask for it. They push it out to you, from the server to the client.

In some cases this is as simple as the page automatically polling to see if there's something new. In other cases it's more advanced where all the data used to build and update the page is coming over an open websocket connection. For our purposes, the transport mechanism is largely irrelevant, the point is, data comes to you.

This inherently breaks the statelessness of webpages. It used to be that I hit a URL and got back a webpage. As a user I understood that the information on the page was (probably) accurate as of the time it was requested. If I wanted to check for something new, I'd go ask for it again and got another snapshot in time.

As soon as we make any effort to keep the information on the page in sync with the server, we've now acknowledged that the webpage has "state". In some ways, the page always *had* state, but it was clear to users that it was snapshotted state, not up-to-date synchronized state. As a result, that static page more like a printed page than a living document.

One of the fundamental advantage that digital media has over print is that it's no longer static. It's dynamic, it's fluid and it can be updated as the information changes. 

So, as soon as we as developers decide we want see if we we want to do partial updates of the page, the only way we can do so is by knowing what we currently have and comparing it to what's on the server. State duplication has occurred and we're now maintaining "state" in some form in the client.

As users get increasingly comfortable with that idea, we'll reach a point where always-current, self-updating information is the expectation rather than a surprise. I promise you, this will happen, whether you're on board or not. If you want to stay at the top of your field as a web developer, you'll have to know how to build apps that work this way.

Anytime you duplicate state, you increase complexity. Because now, rather than worrying about just rendering some data correctly, you're now caring about staleness, caching, and conflicts.

If we step back a bit and look at what we're actually doing, we start to realize that we're actually building is a distributed system and we'll have all the same challenges that come with building distributed systems.

I know what you're probably thinking. Some framework is going to come along that solves this problem for me. You may be right, there are many different approaches to dealing with the problems of duplicated state. There are many frameworks such as Meteor, SocketStream, and Derby.js that aim to simplify the process of building apps that work this way.

The challenge with those frameworks, from where I sit (which at the moment is on a plane 37,000ft over the Atlantic), is that there's a lot of emphasis on trying to share code and logic between the client and the server when client/server really should be performing fundamentally different roles. Servers are for data, clients are for presentation. To me, this is just basic principle of seperation of concerns.

Distributed systems, latency compensation, and state duplication are really complex problems. The way you solve a complex problems is by not solving the complex problems. Instead, you break it down into smaller, simpler, solvable problems. Those solutions in agregate can represent the complete solution. 

So, why bring the complexity of the server to the client and vice/versa? In addition, when you try to share too much server code with a browser it's very easy to fall into the trap of tightly coupling your application to that particular client. This makes it much harder to build other clients, say for example a native iOS app for your app. So while these frameworks are useful for webapps, they may let us down a bit when we want to go beyond that. With more and more talk of "the Internet of things" we have good reason to believe that the breadth of device types that may want to talk to your app will continue to increase.

## Misconceptions, FUD and engineering

jQuery is not an application framework. It's an abstraction layer and toolkit for working with the DOM. I’m not dogging on jQuery, at all, in fact. But most people who are just getting into building client side apps come from a jQuery background and try to use that experience when they’re asked to build increasingly complex client-side applications.

Meanwhile, many self-described "real" developers still think browser code is sissy stuff. Because in their mind, the client is easy and it’s what the designer-y folks do.

But really, they’re scared of the browser and the DOM. The old approach of hitting a database, rendering some html on the server side and then adding a few jQuery fades and transitions on the client-side is *not* what we’re talking about here. 

We’re talking about *engineering* a UI.

The problem is, many of the people who are being asked to build these apps don’t have a heavy engineering background and approach the task much like they would any other client code. 

You have to approach it as an engineering task of building a performant, well-structured UI.

Let’s talk about the when to build an "app" and when perhaps just as importantly, when *not* to.
