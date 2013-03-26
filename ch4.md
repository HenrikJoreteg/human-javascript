# Writing code for humans.

- Code is read more often than it’s written. 
- If you’re too clever,  you’ll forever own the project because no one else will know what the heck you’re doing. That will suck, so will your project.
- As the requirements change and evolve (as they most certainly will), your ability to quickly read and understand the various pieces of your app will dramatically affect how quickly you can change course.

All of this is to say WRITE CODE THAT IS EASY TO READ!

## Tools and trickery

That’s all fine and dandy, but how do you actually do this? 

Well, let me give you a stupid example:

```js
// assume this is an array of strings from somewhere
var myArray = ['hello', 'something', 'awesome']; 

if (~myArray.indexOf('hello')) {
	// under what cirucumstances does this get called?
}
```

Now, compare it to this:

```js
// same array:
var myArray = ['hello', 'something', 'awesome']; 
if (_.contains(myArray, 'hello')) {
	// pretty freakin’ clear, AMIRITE!?
}
```


