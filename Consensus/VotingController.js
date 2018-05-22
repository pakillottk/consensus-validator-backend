const kue = require('kue');
const CodeModel = require('../Database/Code');
const CodeController = require('../Controllers/CodeController')(CodeModel);
const VotingRoom = require('./VotingRoom');

/*
    Assign a voting room to a socket and
    notify the votations data. 

    VotingRooms will be created/removed based on the members attached.
        - Creation: when someone join the room.
        - Removal: when all members have left the room.
*/
class VotingController {
    constructor( broadcastVotation, closeVotationHandler ) {
        //handles the openVotation message of all the voting nodes in a room
        this.broadcastVotation = broadcastVotation;
        //handler the closeVotation message of a room's votation
        this.closeVotationHandler = closeVotationHandler;
        
        //key: socketId, value: a voting room
        this.socketsRooms = {};
        //key: socket room name, value: a VotingRoom object
        this.rooms = {};
        //TTL to set. If room yet not created, stores ttl to assign
        this.ttls ={}
    }

    /*
        Attach a VotingRoom to a socket
    */
    registerSocket( room, socketId ) {
        let roomObj;
        const ttlToSet = this.ttls[ room ];
        if( this.rooms[ room ] ) {
            roomObj = this.rooms[ room ];
        } else {          
            roomObj = new VotingRoom( 
                room, 
                this.broadcastVotation, 
                this.closeVotation.bind(this)
            );            
            this.rooms[ room ] = roomObj;
        }
        if( !this.socketsRooms[ socketId ] ) {
            this.socketsRooms[ socketId ] = [ roomObj ];
        } else {
            this.socketsRooms[ socketId ].push( roomObj );
        }
        if( ttlToSet !== undefined ) {
            console.log( room + " has a start TTL of: " + ttlToSet );
            roomObj.votationTTL = ttlToSet;
        }
        roomObj.memberJoined();
    }

    /*
        Adjust the TTL of a VotingRoom
    */
    adjustTTL( room, TTL ) {
        //console.log( 'Room: ' + room + " TTL: " + TTL );
        const roomObj = this.rooms[ room ];
        if( roomObj ) {
            roomObj.votationTTL = TTL;
        } else {
            this.ttls[ room ] = TTL;
        }
    }

    /*
        Removes a socket from a VotingRoom
    */
    removeSocket( socketId ) {
        const rooms = this.socketsRooms[ socketId ]
        if( rooms ) {
            rooms.forEach( room => {
                room.memberLeft();
                if( room.members === 0 ) {
                    delete this.rooms[ room.room ];
                }
            });            
        }
        delete this.socketsRooms[ socketId ];
    }

    openVotation( room, votation ) {
        this.rooms[ room ].openVotation( votation );
    }

    voteReceived( room, vote ) {
        this.rooms[ room ].voteReceived( vote );
    }

    closeVotation( room, veredict, openerId ) {
        this.closeVotationHandler( room, veredict, openerId );
    }
}

module.exports = ( broadcastVotation, closeVotationHandler ) => new VotingController( broadcastVotation, closeVotationHandler );