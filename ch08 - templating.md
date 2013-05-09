# Stop sending template engines to the browser! Here's a retrospectively obvious way to create templates that happen to be 6 to 10 times faster.

These days, more and more html is rendered on the client instead of sent pre-rendered by the server. So If you’re building a web app that uses a lot of client side javascript you’ll doubtlessly want to create some HTML in the browser.

## How we used to do it
First a bit of history. When I first wrote [ICanHaz.js](http://icanhazjs.com) I was just trying to ease a pain point I was having: generating a bunch of HTML in a browser is a pain.

Why is it a pain? Primarily because JS doesn’t cleanly support multi-line strings, but also because there isn’t an awesome string interpolation system built into JS.

To work around that, ICanHaz.js, as lots of other template clientside template systems do, uses a hack to make it easier to send arbitrary strings to the browser. As it turns out, browsers ignore content in `<script>` tags if you give them a `type` attribute that isn’t `text/javascript`. So, ICanHaz reads the content of tags on the page that say: `<script type=“text/html”>` which can contain templates or any other multi-line strings for that matter. So, ICanHaz will reads those templates and turns each of them into a function that you can call to render that string with your data mixed into it. For example:

This html:

```html
<script id="user" type="text/html">
  <li>
    <p class="name">Hello I'm {{ name }}</p>
    <p><a href="http://twitter.com/{{ twitter }}">@{{ twitter }}</a></p>
  </li>
</script>
```

Is read by ICanHaz and turned into a function you call with your own like this:

```js
// your data
var data = {
  first_name: "Henrik",
  last_name: "Joreteg"
}

// I can has user??
html = ich.user(data)
```

This works, and lots of people clearly thought the same as it’s been quite a popular library.

## Why that’s less-than-ideal
It totally works, but if you think about it, it’s a bit silly. It’s not super fast and you’re making the client do a bunch of extra parsing just to turn text into a function. You also have to send the entire template engine to the browser which is a bunch of wasted bandwidth.

## How we’re doing it now
What I finally realized is that all you actually want when doing templating on the client is the end result that ICanHaz gives you: a function that you call with your data that returns your HTML.

Typically, smart template engines, like the newer versions of Mustache.js, do this for you. Once the template has been read, it gets compiled into a function that is cached and used for subsequent rending of that same template.

Thinking about this leaves me asking: why don’t we just send the javascript template function to the client instead of doing all the template parsing/compiling on the client?

Well, frankly, because I didn’t really know of a great way to do it. 

I started looking around and realized that [Jade](http://jade-lang.com) (which we already use quite a bit at &yet) has support for compiling as a separate process and, in combination with a small little runtime snippet, this lets you create JS functions that don’t need the whole template engine to render. Which is totally awesome!

So, to make it easier to work with, I wrote a little tool: [templatizer](http://github.com/henrikjoreteg/templatizer) that you can run on the server-side (using node.js) to take a folder full of jade templates and turn them into a javascript file that you can include in your app that just has the template rendering functions as javascript.

## The end result
From my tests the actual rendering of templates is **6 to 10 times faster**. In addition you’re sending *way* less code to the browser (because you’re not sending a whole templating engine) and you’re not making the browser do a bunch of work you could have already done ahead of time.
