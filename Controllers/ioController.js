module.exports = ( io ) => {
    io.on( 'connect', ( socket ) => {
        console.log( 'someone connected' );

        socket.on( 'join', ( data ) => {
            console.log( 'joined to room: ' + data );
            socket.join( data );
        });
    });

    
}