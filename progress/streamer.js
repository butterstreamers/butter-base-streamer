const Streamer = require('../streamer')

class ProgressStreamer extends Streamer {
    installProgressHandler(files) {
        files.map(file => file.on('progress', progress => {
            const stats = {
                timeRemaining: progress.eta,
                downloaded: progress.tranferred,
                downloadSpeed: progress.speed,
                uploadSpeed: 0,
                progress: progress.percentage/100,
                ratio: -1,
                numPeers: 1
            }

            Object.assign(this, stats)

            this.emit('progress', stats)
            if (stats.progress === 1 ) {
                this.emit('complete', stats)
            }
        }))

        return files
    }

    filesReady(files) {
        this.installProgressHandler(files)
        super.filesReady(files)
    }
}

module.exports = ProgressStreamer
