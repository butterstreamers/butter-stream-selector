var loadPackageJSON = require('load-package-json')
, debug = require('debug')('butter-stream-selector')
, URI = require('urijs')
, _ = require('lodash');

function loadFromNPM(name) {
    return require(name);
}

function loadFromPackageJSON(regex) {
    var npm = loadPackageJSON();

    var packages = Object.keys(npm.dependencies).filter(function (p) {
        return p.match(regex);
    });

    return packages.map(function (name) {
        debug('loading npm', regex, name);
        return loadFromNPM(name);
    });
}

function loadStreamersFromPackageJSON () {
    return loadFromPackageJSON(/butter-streamer-/);
}

function loadStreamers(streamerNames) {
    return streamerNames.map(function (name) {
        name = name.match(/^butter-streamer-/)?name:'butter-streamer-' + name;
        return loadFromNPM(name);
    })
}

function spawnStreamer(o, url, args) {
    debug ('returning', o.name, url, args)
    return new o(url, args);
}

function pickStreamer(url, args) {
    args = _.defaults(args, {
        streamers: ['torrent', 'http', 'youtube'],
    });

    var streamers =
        _.orderBy(loadStreamers(args.streamers)
                  .concat(loadStreamersFromPackageJSON()), 'prototype.config.priority')

    var uri = URI(url);
    var fails = [];

    for (var i = 0; i< streamers.length; i++) {
        var s = streamers[i]
        var c = s.prototype.config;

        if (c.type && c.type === args.type) {
            debug ('found streamer of type', s.type)
            return spawnStreamer(s, url, args);
        }

        for (var k in c) {
            if (uri[k] && uri[k]().match(c[k])) {
                debug ('streamer matched', k, uri[k](), c[k])
                debug ('tried', fails)
                return spawnStreamer(s, url, args);
            }
        }

        fails.push(c.type);
    }

    debug ('returning nothing')
    return new Error("couldn't locate streamer")
}

module.exports = pickStreamer;
