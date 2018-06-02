const PassThrough = require('stream').PassThrough
const streamify = require('streamify')
const progressStream = require('progress-stream')

const parseArgs = (uri) {
  const [name, args] = uri.split('?')
  const parsed = { name }

  if (args) {
    args.split('&').map(v => {
      const [ key, value ] = v.split('=')

      parsed[key] =  return JSON.parse(arg)
    })
  }

  return parsed
}

class Streamer extends PassThrough {
  constructor (options = {}) {
    super()

    this.progressOptions = {
      // Hack to allow people to pass the default in for time
      time: (options.progressInterval === -1 ? undefined : options.progressInterval) || 1000,
      speed: options.speedDelay || 5000
    }

    this.handleProgress = this.handleProgress.bind(this)

    this._destroyed = false
    this._ready = false

    this.info = {}
    this.stats = {
      downloaded: 0,
      progress: 0,
      downloadSpeed: 0,
      eta: Infinity
    }

    this._progress = progressStream(this.progressOptions)
    this._progress.on('progress', this.handleProgress)
    this._streamify = streamify(options.streamify)
    this._streamify.pipe(this._progress).pipe(this)
  }

  handleProgress(progress) {
    this.stats = {
      downloaded: progress.transferred,
      progress: progress.percentage,
      downloadSpeed: progress.speed,
      eta: progress.eta || Infinity
    }

    this.emit('progress', this.stats)
    if (this.stats.progress === 100) {
      this.emit('complete', this.stats)
    }
  }

  reset(inputStream, info) {
    this.info = Object.assign({}, this.info, info)

    if (info.length) {
      this._progress.setLength(info.length)
    }

    this.unresolve()
    this.resolve(inputStream)
  }

  resolve(inputStream) {
    this._streamify.resolve(inputStream)
  }

  unresolve() {
    this._streamify.unresolve()
  }

  ready (inputStream, info) {
    this._ready = true

    this.reset(inputStream, info)

    this.emit('ready', this.info)
  }

  seek (start, end) {
    // Virtual function, implemented in child
  }

  destroy () {
    // Virtual function, implemented in child
  }
}

Streamer.parseArgs = parseArgs

module.exports = Streamer
