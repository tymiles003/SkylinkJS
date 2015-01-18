/**
 * Handles the XMLHttpStream and API function calls.
 * @class Stream
 * @for Skylink
 * @since 0.6.0
 */
function Stream (stream, config, listener) {
	'use strict';

	// Reference of instance
	var com = this;

	/**
	 * The stream id.
	 * @attribute id
	 * @type String
	 * @private
	 * @for Stream
	 * @since 0.6.0
	 */
	com.id = null;

	/**
	 * The getUserMedia constraints.
	 * @attribute constraints
	 * @type JSON
	 * @private
	 * @for Stream
	 * @since 0.6.0
	 */
	com.constraints = null;

	/**
	 * The streaming configuration.
	 * @attribute config
	 * @type JSON
	 * @private
	 * @for Stream
	 * @since 0.6.0
	 */
	com.config = config;

	/**
	 * The MediaStream object.
	 * @attribute MediaStream
	 * @type Object
	 * @private
	 * @for Stream
	 * @since 0.6.0
	 */
	com.MediaStream = null;

	/**
	 * Starts a MediaStream object connection with getUserMedia.
	 * @method start
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.start = function (constraints) {
		window.getUserMedia(constraints, com.bind, function (error) {
			listener('stream:error', error);
		});
	};

	/**
	 * Binds events to MediaStream object.
	 * @method bind
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.bind = function (bindStream) {
		// Set a MediaStream id if Firefox or Chrome doesn't
		bindStream.id = bindStream.id || Date.UTC();

		// Bind events to MediaStream
		// bindStream.onaddtrack = com.onAddTrack;
		// bindStream.onremovetrack = com.onRemoveTrack;
		bindStream.onended = com.onStreamEnded;

		// Bind track events
		com.bindTracks( bindStream.getAudioTracks() );
		com.bindTracks( bindStream.getVideoTracks() );

		com.MediaStream = stream;
		com.id = stream.id;

		listener('stream:start', stream.id);
	};

	/**
	 * Binds events to MediaStreamTrack object.
	 * @method bind
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.bindTracks = function (bindTracks) {
		for (var i = 0; i < bindTracks.length; i++) {
			bindTracks[i].id = bindTracks[i].id || Date.UTC();

			// Bind events to MediaStreamTrack
			// bindTracks[i].onstarted = com.onStarted;
			bindTracks[i].onended = function (event) {
				com.onTrackEnded(bindTracks[i].id, bindTracks[i].type, event);
			};

			bindTracks[i].onmute = function (event) {
				com.onTrackMute(bindTracks[i].id, bindTracks[i].type, event);
			};

			bindTracks[i].onunmute = function (event) {
				com.onTrackUnmute(bindTracks[i].id, bindTracks[i].type, event);
			};

			bindTracks[i].onoverconstrained = function (event) {
				com.onTrackOverConstrained(bindTracks[i].id, bindTracks[i].type, event);
			};

			// Set the mute status
			bindTracks[i].enabled = true;

			listener('stream:track:start', bindTracks[i].id, bindTracks[i].type, com.id);
		}
	};

	/**
	 * Handles the event when the stream has ended successfully.
	 * @method onStreamEnded
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.onStreamEnded = function (event) {
		listener('stream:stop', stream.id);
	};

	/**
	 * Handles the event when the stream track has ended successfully.
	 * @method onTrackEnded
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.onTrackEnded = function (trackId, type, event) {
		listener('stream:track:stop', trackId, type, com.id);
	};

	/**
	 * Handles the event when the stream track has been muted.
	 * @method onTrackMute
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.onTrackMute = function (trackId, type, event) {
		listener('stream:track:mute', trackId, type, com.id);
	};

	/**
	 * Handles the event when the stream track has been unmuted.
	 * @method onTrackMute
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.onTrackUnmute = function (trackId, type, event) {
		listener('stream:track:unmute', trackId, type, com.id);
	};

	/**
	 * Handles the event when the stream track has been over-constrained.
	 * @method onTrackOverConstrained
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.onTrackOverConstrained = function (trackId, type, event) {
		listener('stream:track:overconstrained', trackId, type, com.id);
	};

	/**
	 * Mutes all audio MediaStreamTracks.
	 * @method muteAudio
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.muteAudio = function () {
		var tracks = com.MediaStream.getAudioTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].enabled = false;
		}
	};

	/**
	 * Unmutes all audio MediaStreamTracks.
	 * @method unmuteAudio
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.unmuteAudio = function () {
		var tracks = com.MediaStream.getAudioTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].enabled = true;
		}
	};

	/**
	 * Stops all audio MediaStreamTracks streaming.
	 * @method stopAudio
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.stopAudio = function () {
		var tracks = com.MediaStream.getAudioTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].stop();
		}
	};

	/**
	 * Mutes all video MediaStreamTracks.
	 * @method muteVideo
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.muteVideo = function () {
		var tracks = com.MediaStream.getVideoTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].enabled = false;
		}
	};

	/**
	 * Stops all video MediaStreamTracks streaming.
	 * @method stopVideo
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.stopVideo = function () {
		var tracks = com.MediaStream.getVideoTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].stop();
		}
	};

	/**
	 * Unmutes all video MediaStreamTracks.
	 * @method unmuteVideo
	 * @trigger StreamJoined, mediaAccessRequired
	 * @for Stream
	 * @since 0.6.0
	 */
	com.unmuteVideo = function () {
		var tracks = com.MediaStream.getAudioTracks();

		for (var i = 0; i < tracks.length; i++) {
			tracks[i].enabled = true;
		}
	};

	com.stop = function () {
		// Stop MediaStream tracks
		com.stopVideo();
		com.stopAudio();
		// Stop MediaStream
		com.MediaStream.stop();
	};

	// Bind or start MediaStream
	if (stream === null) {
		var constraints = globals.getMediaConstraints(config);

		com.start(constraints);

		com.config = config;

	} else {
		com.bind(stream);
	}

}