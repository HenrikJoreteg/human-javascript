# App settings and configuration

## The problem 

App configuration and environment settings are always a PITA, right? Especially when you've got configuration settings you want to pass to your single page app. If we've structured everything as building a "static" js file that gets sent, then how do we pass dynamic values into it for things like configuration?

We solve this problem with a simple approach and two specific tools:

- getconfig: https://github.com/henrikjoreteg/getconfig
- clientconfig: https://github.com/henrikjoreteg/clientconfig

They're in no way dependent on each other but they do play nicely together.  (Both are on npm, by the way).

## getconfig

First, getconfig. This is a tool for configuring Node web apps. It follows the same assumptions as Express (http://expressjs.com/) does, in that it looks to an environment variable (NODE_ENV, reference: http://expressjs.com/api.html#app-settings) to determine the mode in which it should run.

It simply uses that to look for a JSON config file that matches the name of the environment. For example: dev_config.json or production_config.json. It defaults to dev if it doesn't fine one.

Then, from your Node app you just require "getconfig" and access settings directly on the resulting object, which will have pulled it from the correct config file. Super clean/simple:


```javascript
// We just require the module
var config = require('getconfig');

// Which actually returns our environment-aware config
// from the corresponding config file. 
config.mySetting;
```

It just pulls the right config from the right file, no "if" statements, no mess.


## clientconfig 

On the clientside we do something very similar.

```javascript
var config = require('clientconfig');

config.mySetting;
```

This time, instead of looking for an environment variable, the module looks for a cookie called "config" that contains a JSON encoded config object. It immediately reads, then destroys that cookie (to avoid the overhead of sending it around on any subsequent requests).

Clientconfig reads and returns a "frozen" config object (using ES5 Object.freeze, if available) with our settings. So, it's basically the equivalent developer experience as getconfig, but for the client.


## Using them together 

In combination, it gets pretty slick:

Say we have a dev_config.json that looks like this, on our server.

```json
{
  "myProjectSetting": "someSetting",
  "clientAppSettings": {
    "apiUrl": "https://api.andbang.com",
    "trackMetrics": false
  }
}
```

\*note the "clientAppSettings" section.

Now, in our main server file where we handle the requests for single page apps, we then add on our config cookie with the data from getconfig using a very simple piece of middleware.


```javascript
// Set up our app and require getconfig
var app = require('express')(),
    config = require('getconfig'); 

// Build a tiny middleware function that sets the cookie
var configMiddleware = function (req, res, next) {
  res.setCookie('config', JSON.stringify(config.clientAppSettings);
  next();
};

// In the code that serves our singlepage app, use the middleware
app.get('/app', configMiddleware, function (req, res) {
  res.send(clientApp.html());
});
```

Just like that, we've got a simple unified config file on our server where we can store all environment specific settings for the whole app. It becomes very painless to pass settings to our clientapp based on our environment without having to think about it. 

The other benefit of this approach is that it lets us keep our clientside JS app as a completely static file. We don't have to do custom builds that write in settings or anything while still avoiding additional HTTP requests to fetch settings.


## Security caveats

Please avoid if sending any valuable settings across the wire this way, especially if you're not using https. Cookies are just http headers, so it's best to assume that this is not secure information and thus, should only be used for non-sensitive data.
