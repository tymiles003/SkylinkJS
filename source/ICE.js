var ICE = {
  queueCandidate: function () {
  },
  
  popCandidate: function () {
  },
  
  addCandidate: function (peer, candidate, defer) {
    
  },
  
  newIceConnectionStates: {
    starting : 'starting',
    checking : 'checking',
    connected : 'connected',
    completed : 'connected',
    done : 'completed',
    disconnected : 'disconnected',
    failed : 'failed',
    closed : 'closed'
  },
  
  parseIceConnectionState: function (peer, defer) {
    var state = peer.iceConnectionState;
    
    var checkState = this.newIceConnectionStates[state];
    
    if (!peer.iceConnectionFiredStates[peerId] || checkState === 'disconnected' || 
        checkState === 'failed' || checkState === 'closed') {
      peer.iceConnectionFiredStates = [];
    }
    
    var newState = newIceConnectionStates[iceConnectionState];
    
    if (peer.iceConnectionFiredStates.indexOf(newState) < 0) {
      peer.iceConnectionFiredStates.push(newState);
      
      if (newState === 'connected') {
        setTimeout(function () {
          peer.iceConnectionFiredStates.push('done');

          defer('completed');
        }, 1000);
      }
      defer(newState);
    }
  },
  
  
};