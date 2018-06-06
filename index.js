const streamify = require('streamify')
const progressStream = require('progress-stream')
const debug = require('debug')('butter-streamer')

const parseArgs = require('./parse')
const Streamer = require('./streamer')

Streamer.parseArgs = parseArgs

module.exports = Streamer
