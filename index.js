const PassThrough = require('stream').PassThrough
const streamify = require('streamify')
const progressStream = require('progress-stream')
const debug = require('debug')('butter-streamer')

const parseArgs = require('./parse')

class Streamer extends PassThrough {
  constructor (source, options = {}, config = {}) {
    super()

    this.config = config
    this.options = options
    this.source = source

    this.progressOptions = {
      // Hack to allow people to pass the default in for time
      time: (options.progressInterval === -1 ? undefined : options.progressInterval) || 1000,
      speed: options.speedDelay || 5000
    }

    this.handleProgress = this.handleProgress.bind(this)

    this._destroyed = false
    this._ready = false
    this.ready = this.ready.bind(this)

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

    this.createStream(source)
        .then(this.ready)
        .catch(e => debug('ERROR', e))
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

  _reset (inputStream, length) {
    debug('reset', length)

    this._streamify.unresolve()
    this._streamify.resolve(inputStream)

    this.inputStream = inputStream

    if (length) {
      this.length = length
      this._progress.setLength(length)
    }
  }

  ready ({stream, length}) {
    this._reset(stream, length)
    debug('ready')
    if (! this._ready) {
      this._ready = true
      this.emit('ready', length)
    }
  }

  seek (start = 0, end) {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')
    if (!this._ready) throw new Error('Streamer not ready')

    const opts = Object.assign({
      start: start
    }, end ? {end}: null)

    debug('seek', opts)
    this.createStream(this.source, opts)
                       .then(this.ready)
                       .catch(e => debug('ERROR', e))
  }

  destroy () {
    if (this._destroyed) throw new ReferenceError('Streamer already destroyed')

    if (this.inputStream) {
      this.inputStream.pause()
    }
    if (this._progress) {
      this._progress.pause()
    }
    this.pause()

    this._streamify.unresolve()

    if (this._progress) {
      this._progress.destroy && this._progress.destroy()
    }
    if (this.inputStream) {
      this.inputStream.destroy()
    }
    super.destroy()

    this._destroyed = true
  }
}

Streamer.parseArgs = parseArgs

module.exports = Streamer
