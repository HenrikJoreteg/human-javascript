# human javascript

Code is as much about people as it is about computers. Sure, it's run by computers, but it's written by, maintained by, and ultimately created for people. People are not computers. We are not robots. We are unpredictable. The same people with the same input won't produce the same output each time. We don't work well in isolation. In fact, in order to do our best work we *need* to work with other people. Yet, as developers its easy for us to focus on optimizing for technology and forget to optimize for people.

You can read about javascript, the language, elsewhere. Its good parts, bad parts, and ugly parts are well documented. This is a book about a specific set of tools, patterns and approches that are optimized for people. These approaches enable our team to quickly build and deliver high-quality javascript applications for humans.

&yet, the team that I'm humbled to be a part of, is a small (~20 person) bootstrapped consulting and product company focused heavily on realtime single page web applications. We've had the opportunity to build a very broad range of single page applications for all kinds purposes and audiences. We've built stuff for mobile, desktop, browser extensions, phonegap, you name it. In these experiences patterns start to emerge. Patterns that enable us to efficiently ship real-life applications (with real-life deadlines) as a team.

As we've gone along we've done our best to extract re-usable tools out of them. So, in some ways we accidentally wrote this book. What I mean is that much of its contents is compiled from past blogposts, explanations to teammates and clients and from project README files. This book is primarily an extraction, not a creation. We're sharing our experience, secrets and tools to hopefully give you and your team a solid footing for building great apps and experiences as a team.


# Native HTML5 apps

If you own a "smart" phone of any sort, you’ve been innundated with a new slangish word over the past 5 years or so: "app"

Rather than pontificate on the meaning of this for three chapters, I’ll summarize the distinction as I see it for the purposes of this book. 

Most people say they're building a "web app" they're talking about writing source code that describes an application that will run on the server and send rendered HTML to the browser.

What I'm talking about in this book could really be called "Native HTML5 app" in that it uses html 5 to its full extend and isn't designed to be backward compatible to crappy old browsers. The other destinction being that the source code itself is sent to the browser rather than the output. So these apps actually "run" in the browser instead of on a server.

To clarify further:

1. We send the application code itself to the browser, not the result of running the application code.
1. The client fetches it's own data in a data format (typically JSON), not as pre-rendered html.
1. The app is loaded once and never does a full page reload while you’re using it.
1. Has "state" that is maintained seperate from the server.

From now on, when I say "app" or "browser app" or "client app" within these pages, that is what I'm referring to.

Here’s the additional trickery: once you acknowledge that the browser has state you really ought to think about how to keep that state up to date and make it a "realtime" application. But I digress. 

# 


# what people want

In doing javascript training and working with a variety of teams there are a few common threads that keep coming up. We

