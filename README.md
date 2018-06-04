butter-streamer: base class for all butter-streamers
===

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
    super(options, config)
  }
}

Streamer.config = config

module.exports = HttpStreamer
```

that's all you *need* to do, but to do anything usefull you probably want
to keep reading

you probably want to implement 3 things, the `config` object, the
object `constructor`, and the `seek` method

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

seek method
==

The `seek` method has the signature `seek(Number:start, Number:end)`, it
should call `reset` that has the same signature as `ready` (we don't call
`ready` here so that you can listen to `ready` and not get notified on every
seek)

for instance:
```js
	seek (start = 0, end) {
		this._fileStream = fs.createReadStream(this._source, {start: start, end: end})
		this.reset(this._fileStream, this.stats.size - start)
  }
```

you should do the `source` house keeping.
