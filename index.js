const PassThrough = require('stream').PassThrough
const streamify = require('streamify')
const progressStream = require('progress-stream')

class Streamer extends PassThrough {
  constructor (options) {
    options = options || {}
    const progressOptions = {
      // Hack to allow people to pass the default in for time
      time: (options.progressInterval === -1 ? undefined : options.progressInterval) || 1000,
      speed: options.speedDelay || 5000
    }

    super()

    this._destroyed = false

    this.downloaded = 0
    this.progress = 0
    this.downloadSpeed = 0
    this.eta = Infinity

    this._streamify = streamify(options.streamify)
    this._progress = progressStream(progressOptions)

    this._progress.on('progress', (progress) => {
      this.downloaded = progress.transferred
      this.progress = progress.percentage
      this.downloadSpeed = progress.speed
      this.eta = progress.eta || Infinity

      this.emit('progress', {
        downloaded: progress.transferred,
        progress: progress.percentage,
        downloadSpeed: progress.speed,
        eta: progress.eta || Infinity
      })
    })

    this._streamify.pipe(this._progress).pipe(this)
  }

  seek (start, end) {
    // Virtual function, implemented in child
  }

  destroy () {
    // Virtual function, implemented in child
  }
}

module.exports = Streamer
