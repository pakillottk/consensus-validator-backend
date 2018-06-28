const Model = require( './Model' );
const Zone = require('./RecintZone');
const User = require( './User' );

class SeatReserve extends Model {
    static get tableName() {
        return 'SeatReserves';
    }

    static get relationMappings() {
        return {
            zone: {
                relation: Model.BelongsToOneRelation,
                modelClass: Zone,
                join: {
                    from:'SeatReserves.zone_id',
                    to: 'RecintZones.id'
                }
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'SeatReserves.user_id',
                    to: 'Users.id'
                }
            }
        };
    }

    async $afterInsert( context ) {
        await super.$afterInsert( context );
        
        Model.io.emitTo( this.session_id + '-session', 'seatreserve_created', this );
    }

    async $afterUpdate( context ) {
        await super.$afterUpdate( context );
        
        Model.io.emitTo( this.session_id + '-session', 'seatreserve_updated', this );
    }

    static async $afterDelete( deleted ) {
        Model.io.emitTo( deleted.session_id + '-session', 'seatreserve_deleted', deleted );
    }
}

module.exports = SeatReserve;