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
    }

    /*
        Attach a VotingRoom to a socket
    */
    registerSocket( room, socketId ) {
        let roomObj;
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
        this.socketsRooms[ socketId ] = roomObj;
        roomObj.memberJoined();
    }

    /*
        Removes a socket from a VotingRoom
    */
    removeSocket( socketId ) {
        const room = this.socketsRooms[ socketId ]
        delete this.socketsRooms[ socketId ];
        if( room ) {
            room.memberLeft();
            if( room.members === 0 ) {
                delete this.rooms[ room.room ];
            }
        }
    }

    openVotation( votation ) {
        this.socketsRooms[ votation.openedBy ].openVotation( votation );
    }

    voteReceived( vote ) {
        this.socketsRooms[ vote.votation.openedBy ].voteReceived( vote );
    }

    closeVotation( room, veredict ) {
        this.closeVotationHandler( room, veredict );
    }
}

module.exports = ( broadcastVotation, closeVotationHandler ) => new VotingController( broadcastVotation, closeVotationHandler );