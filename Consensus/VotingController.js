class VotingController {
    constructor() {
        this.socketsRooms = {}
    }

    registerSocket( room, socketId ) {
        this.socketsRooms[ socketId ] = room;
        console.log( this.socketsRooms );
    }

    removeSocket( socketId ) {
        delete this.socketsRooms[ socketId ];
        console.log( this.socketsRooms )
    }
}

module.exports = new VotingController();