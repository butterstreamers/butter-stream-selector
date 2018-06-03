const loadPackageJSON = require('load-package-json')
const debug = require('debug')('butter-stream-selector')
const URI = require('urijs')
const _ = require('lodash')

function loadFromNPM (name) {
  return require(name)
}

function loadFromPackageJSON (regex) {
  var npm = loadPackageJSON()

  var packages = Object.keys(npm.dependencies).filter(function (p) {
    return p.match(regex)
  })

  return packages.map(function (name) {
    debug('loading npm', regex, name)
    return loadFromNPM(name)
  })
}

function loadStreamersFromPackageJSON () {
  return loadFromPackageJSON(/butter-streamer-/)
}

function loadStreamers (streamerNames) {
  return streamerNames.map(function (name) {
    name = name.match(/^butter-streamer-/) ? name : 'butter-streamer-' + name
    return loadFromNPM(name)
  })
}

function spawnStreamer (Streamer, url, args) {
  debug('returning', Streamer.name, url, args)
  return new Streamer(url, args)
}

function pickStreamer (url, passedArgs) {
  const args = Object.assign({
    streamers: ['torrent', 'http', 'youtube']
  }, passedArgs)

  const streamers =
        _.orderBy(loadStreamers(args.streamers)
          .concat(loadStreamersFromPackageJSON()), 'config.priority')

  const uri = URI(url)
  const fails = []

  for (let i = 0; i < streamers.length; i++) {
    const Streamer = streamers[i]
    const {config} = Streamer

    if (config.type && config.type === args.type) {
      debug('found streamer of type', Streamer.type)
      return spawnStreamer(Streamer, url, args)
    }

    for (let configItem in config) {
      if (uri[configItem] && uri[configItem]().match(config[configItem])) {
        debug('streamer matched', configItem, uri[configItem](), config[configItem])
        debug('tried', fails)
        return spawnStreamer(Streamer, url, args)
      }
    }

    fails.push(config.type)
  }

  debug('returning nothing')
  return new Error("couldn't locate streamer")
}

module.exports = pickStreamer
