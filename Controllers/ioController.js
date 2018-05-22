const LogEntry = require('../Database/LogEntry');

module.exports = ( io ) => {
    const VotingController = require('../Consensus/VotingController')( 
        async ( room, votation ) => {
            console.log( 'broadcast to: ' + room );
            console.log( votation );
            io.to( room ).emit( 'votation_opened', {room, votation} );

            const sessionId = room.split( '-' )[0];
            const userId = votation.openerId;
            const entry = await LogEntry.query().insert({
                date: new Date(),
                user_id: userId,
                session_id: sessionId,
                level: 'info',
                msg: 'Ha escaneado: ' + votation.code
            });
        },         
        async ( room, consensus, openerId ) => {
            console.log( 'emitting votation end to: ' + room );
            console.log( consensus );
            io.to( room ).emit( 'votation_closed', {room, votation: consensus} );

            const sessionId = room.split( '-' )[0];
            const userId = openerId;
            await LogEntry.query().insert({
                date: new Date(),
                user_id: userId,
                session_id: sessionId,
                level: consensus.verification === 'not_valid' ? 'error' : 'success',
                msg: consensus.consensus.code + (consensus.verification === 'not_valid' ? ' no es válido' : ' es válido') +
                     '. ' + consensus.message
            });
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

        socket.on( 'open_votation', ( data ) => {
            VotingController.openVotation( data.room, data.votation );
        });

        socket.on( 'vote', ( data ) => {
            VotingController.voteReceived( data.room, data.veredict );
        });

        socket.on( 'ping_req', (data) => {        
            socket.emit( 'pong_res', {data} );
        });

        socket.on( 'adjust_ttl', (data) => {
            VotingController.adjustTTL( data.room, data.TTL );
        });
    }); 
    
    return {
        emitTo: ( room, type, data ) => {
            io.to( room ).emit( type, data );
        }
    }
}