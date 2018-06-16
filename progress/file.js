const EventEmitter = require('events').EventEmitter
const progress = require('progress-stream')

const debug = require('debug')('butter-stream:progress-file')

class ProgressFile extends EventEmitter {
    constructor(length) {
        super()

        this._offset = 0
        this._progress = progress({
            length,
            time: 200 // ms
        })

        this._progress.on('progress', progress => {
            debug('progress', progress)

            this.emit('progress', progress)
        })
    }

    get length() { return this._length }
    set length(value) {
        debug('setLength', value)
        this._length = value
        this._progress.setLength(value - this._offset)
    }

    createReadStream(range = {}) {
        debug('createReadStream', range)
        this._offset = Number(range.start)
        this._progress.setLength(this._length - this._offset)
        return this._createReadStream(range)
                   .pipe(this._progress)
    }
}

module.exports = ProgressFile
