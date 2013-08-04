# Writing code for humans.

- Code is read more often than it’s written. 
- If you’re too clever, you’ll forever own the project because no one else will know what the heck you’re doing. That will suck, and so will your project.
- As the requirements change and evolve (as they most certainly will), your ability to quickly read and understand the various pieces of your app will dramatically affect how quickly you can change course.

All of this is to say WRITE CODE THAT IS EASY TO READ!

## Tools and trickery

You with me? Ok, but how do you actually do this? 

Well, let me give you a silly example:

```javascript
// assume this is an array of strings from somewhere
var myArray = ['hello', 'something', 'awesome']; 

if (~myArray.indexOf('hello')) {
	// under what cirucumstances does this get called?
}
```

Can you explain to me, in plain English, what that tilde does? If you can, good for you, but do you think your whole team can?

Now, compare it to this:

```javascript
// same array:
var myArray = ['hello', 'something', 'awesome']; 
if (myArray.indexOf('hello') == -1) {
	// pretty freakin’ clear, AMIRITE!?
}
```

Or even this using underscore:

```javascript
// same array:
var myArray = ['hello', 'something', 'awesome']; 
if (_(myArray).contains('hello')) {
  // also pretty freakin’ clear right?
}
```

Frankly, I think the first example looks better, visually. In fact I sometimes use the first when working on a library that isn't meant to be a team project. However, if I'm working on an app that other people will be working on with me, I will write it the second way, because it's more explicit and requires less of the other developers who may not be familiar with the syntax in the first example.


## Cleverness is a double edged sword

Being clever is sometimes a good thing. But as was so aptly put by Paddy Foran (http://paddy.io/posts/cleverness/) cleverness for the sake of cleverness should be avoided at all costs. 

The goal should always be clarity and readability.

## Code Linting

Related to readability is that code conventions and format should be consistent throughout the project. In practice, if you have multiple people involved in a project, this can be hard.

Semicolons, tabs, and spaces are contentious things among developers. Every developer I've ever met has opinions (usually strongly held) about when/where to use what syntax.

If you’re building large JS apps and not doing some form of static analysis on your code, you’re asking for trouble. It helps catch silly errors and forces code style consistency. Ideally, no one should be able to tell who wrote what part of your app. If you’re on a team, it should all be uniform within a project. How do you do that? We use a slick tool written by [Nathan LaFreniere](https://twitter.com/quitlahok) on our team called, simply, [precommit-hook](http://github.com/nlf/precommit-hook). So all we have to do is add "precommit-hook" to our list of dependencies (in a node project).

What that will do is create a git pre-commit hook that uses JSHint to check your project for code style consistency before each commit. Once upon a time there was a tool called JSLint written by Douglas Crockford. Nowadays (love that silly word) there’s a less strict, more configurable version of the same project called [JSHint](http://www.jshint.com/). 

The neat thing about the npm version of JSHint is that if you run it from the command line it will look for a configuration file (.jshintrc) and an ignore file (.jshintignore), both of which the precommit hook will create for you if they don’t exist. You can use these files to configure JSHint to follow the code style rules that you’ve defined for the project. This means that you can now run `jshint.` at the root of your project and lint the entire thing to make sure it follows the code styles you’ve defined in the `.jshintrc` file. Awesome, right!?!

Our `.jshintrc` files usually looks something like this:

```json
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
```

The awesome thing about this approach is that you can enforce consistency, the rules for the project are contained, and actually checked into the project repo itself (in the form of the jshintrc file). So, if you decide to have a different set of rules for the next project, fine. It’s not a global setting; it’s defined and adjusted by whomever runs the project.

For a more in-depth discussion on style and style guides I highly recommend reading Airbnb's javascript style guide: https://github.com/airbnb/javascript. It will give you a good overview of the various common style discrepancies and the reasoning behind some of the choices. It's also a great starting point if you want to fork it and tweak it to be "the style guide" for your team.
