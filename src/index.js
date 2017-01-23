class ListPlayer extends EventEmitter { // eslint-disable-line
  constructor (options = {}) {
    super()
    this.tracks = (options.tracks || []).map((t) => {
      if (typeof t === 'string') return { src: t }
      return t
    })
    this.loopTracks = options.loopTracks !== undefined ? options.loopTracks : true
    this.progressThroughTracks = options.progressThroughTracks !== undefined ? options.progressThroughTracks : true
    this.el = this._injectAudioElement()
    this.index = 0
    this._loadTrack()
    this.el.addEventListener('ended', () => {
      if (this.progressThroughTracks) {
        this.next()
        this.play()
      }
    })
    if (this.advanced) this._loadAudioContext()
  }

  play () {
    this.emit('play')
    this._loadTrack()
    return this.el.play()
  }

  pause () {
    this.emit('pause')
    return this.el.pause()
  }

  next () {
    this.emit('next')
    this.index++
    if (this.index > this.tracks.length - 1) {
      if (this.loopTracks) {
        this.index = 0
      } else {
        this.index--
        this.emit('error', 'you are on the last track')
      }
    }
    const _wasPlaying = this.playing()
    this._loadTrack()
    if (_wasPlaying) this.play()
  }

  prev () {
    this.emit('prev')
    this.index--
    if (this.index < 0) {
      if (this.loopTracks) {
        this.index = this.tracks.length - 1
      } else {
        this.index++
        this.emit('error', 'you are on the first track')
      }
    }
    const _wasPlaying = this.playing()
    this._loadTrack()
    if (_wasPlaying) this.play()
  }

  playing () {
    return !this.el.paused
  }

  seek (time) {
    if (!time) return this.el.currentTime
    this.emit('seek', time)
    this.el.currentTime = time
  }

  /**
   * Injects an audio element to the body and hides it.
   * @private
   */
  _injectAudioElement () {
    const el = document.createElement('audio')
    document.body.appendChild(el)
    el.style.display = 'none'
    return el
  }

  /**
   * Loads a track into the player
   * @private
   */
  _loadTrack () {
    if (this._loadedTrack === this.index) return
    if (this.tracks.length === 0) return
    this.el.innerHTML = ''

    this.currentTrack = this.tracks[this.index]
    const source = document.createElement('source')
    source.src = this.currentTrack.src
    source.type = this.currentTrack.type || 'audio/mp3'

    this.el.appendChild(source)
    this.el.load()
    this._loadedTrack = this.index
  }

  _loadAudioContext () {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return this.emit('error', 'web audio api unsupported')
    this.ctx = new AudioContext()
    this.src = this.ctx.createMediaElementSource(this.el)
  }
}
