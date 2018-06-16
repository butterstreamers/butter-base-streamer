const debug = require('debug')('butter-streamer:streamer')
const EventEmitter = require('events').EventEmitter

class Streamer extends EventEmitter {
    constructor (source, options = {}, config = {}) {
        super()

        this.source = source
        this.options = options
        this.config = config

        this.ready = false

        this.initialize(source, options, config)
            .then(files => this.filesReady(files))
    }

    filesReady(files) {
        debug('files ready', files.map(f => f.name))
        this.ready = true
        this.files = files

        this.emit('ready', this)
    }

    destroy() {
        this.files && this.files.map(file => file.destroy && file.destroy())
        this.files = null
    }
}

module.exports = Streamer
