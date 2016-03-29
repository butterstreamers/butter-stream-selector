var http = require('http');
var assert = require('assert');
var Selector = require('../');
var fs = require('fs');

describe('Streaming Server', function() {
	var urls = [
		{type: 'youtube', url: 'https://www.youtube.com/watch?v=3Q1oyEXMXs4&feature=youtu.be&t=4230',},
		{type: 'youtube', url: 'https://www.youtube.com/watch?v=S-k4AHbfstw'},
		{type: 'youtube', url: 'youtube://xD3G6eM3tPI'},
		{type: 'http', url: 'http://archive.org/download/BigBuckBunny1280x720Stereo/big_buck_bunny_720_stereo.mp4'},
		{type: 'https', url: 'https://archive.org/download/BigBuckBunny_442/film0001_512kb.mp4'},
		{type: 'torrent', url: 'http://vodo.net/media/torrents/Pioneer.One.SEASON1.720p.x264-VODO.torrent'}
	]

	urls.map(function (desc) {

		var streamer = Selector(desc.url);

		it('should return ' + desc.type, function(done) {
			assert.equal(streamer.type, desc.type)
		});
	})
})


