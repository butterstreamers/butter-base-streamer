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
    super(options)
    this.config = config
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

object constructor
==

seek method
==
