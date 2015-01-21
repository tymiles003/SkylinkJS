/**
 * Handles the XMLHttpPeer and API function calls.
 * @class StreamPeer
 * @for Skylink
 * @since 0.6.0
 */
function StreamPeer (config, listener) {
	'use strict';

	// Reference of instance
	var com = this;

	/**
	 * The peer id.
	 * @attribute id
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.id = config.id || null;

	/**
	 * The peer id.
	 * @attribute id
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.peers = config.id || null;



	// Inherit reference from parent class
	com = new Peer(config, constraints, listener);

	/**
	 * The user id that the peer is tied to.
	 * @attribute userId
	 * @type String
	 * @private
	 * @for Peer
	 * @since 0.6.0
	 */
	com.userId = config.userId;


	com.stream = new Stream(stream, config.mediaConstraints, listener);

	com.connect = function () {

	}
}