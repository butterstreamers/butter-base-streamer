butter-streamer: base class for all butter-streamers
===
![Butter Streamers](https://avatars0.githubusercontent.com/u/17933007?v=3&s=252 "logo")
![Travis Build](https://api.travis-ci.org/butterstreamers/butter-streamer.svg?branch=master "build")

a `butter-streamer` is a component that will handle streaming trough
https://github.com/butterstreamers/butter-stream-server to a butter app. The
idea is to be able to handle any kind of source as if it was HTTP, so that
the client code stays nice and clean.

we provide streamers for `http`, `youtube` and `torrent` but feel free to
write your own for other protocols and submit them to us (`rtmp`, `rtsp`,
`dash` and whatnot come to mind)

`butter-streamers` work through ES6 classes, to get started you should
import this package, and create a config object
```js
const Streamer = require('butter-base-streamer')

const config = {
  name: 'HTTP Streamer',
  protocol: /https?/,
  type: 'http',
  priority: 100
}

/* -- HTTP Streamer -- */
class HttpStreamer extends Streamer {
  constructor (source, options = {}) {
    super(source, options, config)
  }
}

Streamer.config = config

module.exports = HttpStreamer
```

that's all you *need* to do, but to do anything usefull you probably want
to keep reading

you probably want to implement 3 things, the `config` object, the
object `constructor`, and the `createStream` method

config object
==

the config object is what is used to select your streamer in
https://github.com/butterstreamers/butter-stream-selector you describe what
kind of uri regex and protocol you compete for (with other streamers) and
what is your priority, please be civic about priorities and select a number
between 10 and 50.

it has the following shape
```js
const config = {
  name: String,                /* human readable name */
  protocol: RegEXp | String ,  /* Regular Expression or string to be matched 
                                  against the protocol part */
  suffix: RegExp | String,     /* Regular Expression or string to be matched
                                  against the uri part */
  type: String,                /* An identifier used to map this streamer,
                                  all lowercase, no spaces, no special chars */
  priority: Number             /* the percieved priority, should be a number
                                  between 10 and 50 */
}
```

object constructor
==

Provided that your class depends on Streamer the constructor is pretty
simple you should do a few things though:
 - call super, to allow for options and config to be bound, and all default
 methods to be active
```js
 class FileStreamer extends Streamer {
	constructor (source, options = {}) {
		super(options, config)
```
 - call `ready` either by `this.ready()` or `super.ready()` if you really
 really need to have your method called `ready`

 the `ready` callback takes 2 arguments, a `Stream` and a `Number: length`
 that is the size in bytes of the remaining part

 for instance:
```js
		fs.stat(path, (err, stats) => {
			this._fileStream = fs.createReadStream(source)
			this.ready(this._fileStream, stats.size)
		})
```

don't forget to attach it to your instance object before exporting !

```js
FileStreamer.config = config
module.exports = FileStreamer
```

createStream method
==

The `createStream` method has the signature
`Promise createStream(source:String, opts:Object{start:Number, end:Number})`
it should return Promise that resolves to an object with the following shape
```js
const createStreamObject = {
    stream: Stream:Object /* (eventually seeked to the opts values) */,
    file:   File:Object   /* a file object see below */
}
```

The file Object has the following shape:
```js
const FileObject = {
    length: Number  /* size in bytes of this file */
    type:   String  /* mime type for this file */
    name:   String  /* a naming suggestion for this file, should be unique
                       by file */
}
```

for instance:
```js
	createStream (source, opts) {
        return Promise.resolve({
                stream: fs.createReadStream(source, opts),
                length: this.length - opts ? opts.start : 0
            }
		))
	}
```

note that in the real word we actually call stat to get length:
```js
	createStream (source, opts) {
		return new Promise ((accept, reject) => (
			fs.stat(source, (err, stats) => {
				if (err) reject(err)
				accept({
					stream: fs.createReadStream(source, opts),
					length: stats.size - opts.start
				})
			})
		))

	}
```

the `source` housekeeping is done by this library

destroy
==

we will destroy the `stream` passed by `createStream` for you, but if you
need to do more cleaning, you can implement the `destroy()` method, please
don't forget to call `super.destroy()` when you're done
