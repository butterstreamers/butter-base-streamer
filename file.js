const debug = require('debug')('butter-streamer:file')
const events = require('events')
const ChunkStream = require('chunk-store-stream')
const ImmediateChunkStore = require('immediate-chunk-store')
const FSChunkStore = require('fs-chunk-store')

class File extends events.EventEmitter {
    constructor (createReadStream, {chunkSize = 1024}) {
        this.chunkSize = chunkSize
        this.store = new ImmediateChunkStore(new FSChunkStore(chunkSize))
    }

    const checkBounds (range) {
        return {
            start: (range && range.start) || 0,
            end = (range && range.end && range.end < this.length)
                ? range.end
                : this.length - 1
        }
    }

    createReadStream(range) {
        const {start, end} = checkBounds(range)
        const opts = {
            start: start / this.chunkSize | 0,
            end: end / this.chunkSize | 0
        }

        this.stream = new ChunkStream(this.store, opts)
    }
}
