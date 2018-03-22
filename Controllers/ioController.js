const VotingController = require('../Consensus/VotingController');

module.exports = ( io ) => {
    io.on( 'connect', ( socket ) => {
        socket.on( 'join', ( data ) => {
            socket.join( data.room );
            if( data.voter ) {
                VotingController.registerSocket( data.room, socket.id );
                socket.emit( 'welcome', {
                    id: socket.id,
                    room: data.room,
                    joinedAt: new Date()
                });
            }            
        });

        socket.on( 'leave', ( data ) => {
            socket.leave( data );
            VotingController.removeSocket( socket.id );
        });
        
        socket.on( 'disconnect', () => {
            VotingController.removeSocket( socket.id );
        })
    });    
}