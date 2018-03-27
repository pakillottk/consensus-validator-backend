module.exports = ( io ) => {
    const VotingController = require('../Consensus/VotingController')( 
        ( room, votation ) => {
            console.log( 'broadcast to: ' + room );
            io.to( room ).emit( 'votation_opened', votation );
        },         
        ( room, consensus ) => {
            console.log( 'emitting votation end to: ' + room );
            console.log( consensus );
            io.to( room ).emit( 'votation_closed', consensus );
        }
    );

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

        socket.on( 'open_votation', ( votation ) => {
            VotingController.openVotation( votation );
        });

        socket.on( 'vote', ( veredict ) => {
            VotingController.voteReceived( veredict );
        });
    });    
}