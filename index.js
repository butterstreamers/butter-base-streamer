const PassThrough = require('stream').PassThrough
const streamify = require('streamify')
const progressStream = require('progress-stream')
const debug = require('debug')('butter-streamer')

const parseArgs = require('./parse')

class Streamer extends PassThrough {
  constructor (options = {}, config = {}) {
    super()

    this.config = config
    this.options = options

    this.progressOptions = {
      // Hack to allow people to pass the default in for time
      time: (options.progressInterval === -1 ? undefined : options.progressInterval) || 1000,
      speed: options.speedDelay || 5000
    }

    this.handleProgress = this.handleProgress.bind(this)

    this._destroyed = false
    this._ready = false

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

  handleProgress (progress) {
    this.stats = {
      downloaded: progress.transferred,
      progress: progress.percentage,
      downloadSpeed: progress.speed,
      eta: progress.eta || Infinity
    }

    debug('progress', this.stats)
    this.emit('progress', this.stats)
    if (this.stats.progress === 100) {
      debug('complete', this.stats)
      this.emit('complete', this.stats)
    }
  }

  reset (inputStream, length) {
    debug('reset', length)

    this.close()
    this.open(inputStream)

    if (length) {
      this._progress.setLength(length)
    }
  }

  open (inputStream) {
    this._streamify.resolve(inputStream)
  }

  close () {
    this._streamify.unresolve()
  }

  ready (inputStream, length) {
    this._ready = true
    this.reset(inputStream, length)
    debug('ready')
    this.emit('ready', length)
  }

  seek (start, end) {
    // Virtual function, implemented in child
  }

  destroy () {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')
    this.close()
    this._destroyed = true
  }
}

Streamer.parseArgs = parseArgs

module.exports = Streamer
