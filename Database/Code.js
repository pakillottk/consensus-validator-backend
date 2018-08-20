const Model = require( './Model' );
const Type = require( './Type' );
const Zone = require( './RecintZone' );
const crypto = require( 'crypto' );

class Code extends Model {
    static get tableName() {
        return 'Codes';
    }

    static get relationMappings() {
        return {
            type: {
                relation: Model.BelongsToOneRelation,
                modelClass: Type,
                join: {
                    from:'Codes.type_id',
                    to: 'Types.id'
                }
            },
            zone: {
                relation: Model.BelongsToOneRelation,
                modelClass: Zone,
                join: {
                    from:'Codes.zone_id',
                    to: 'RecintZones.id'
                }
            }
        }
    };

    static get columns() {
        return [
            'id',
            'code',
            'type_id',
            'name',
            'email',
            'maxValidations',
            'validations',
            'out',
            'zone_id',
            'row_index',
            'seat_index',
            'seat_number',
            'created_at',
            'updated_at'
        ]
    }

    static generateCode( userId, typeId ) {
        const hashData = userId + "" + Math.round(Math.random()*5000) + "" + typeId + "" + new Date().toString() + "" + new Date().getTime(); 
        const hashCode = crypto.createHash('sha256').update(hashData).digest("hex");
        return 'CNS'+hashCode.substr(0,9)
    }

    async $afterInsert( context ) {
        await super.$afterInsert( context );
        const ioController = Model.io;
        let sessionId;
        const type = await Type.query().select( 'session_id' ).where( 'id', '=', this.type_id );
        if( type.length > 0 ) {
            sessionId = type[0].session_id;
        }
        if( sessionId ) {
            ioController.emitTo( sessionId + '-session', 'code_added', this );        
        }
    }

    async $afterUpdate( context ) {
        await super.$afterUpdate( context );
        
        const type = await Type.query().select( 'session_id' ).where( 'id', '=', this.type_id );
        const sessionId = type[0].session_id;

        const ioController = Model.io;
        ioController.emitTo( sessionId + '-session', 'code_updated' ,this );
    }
}

module.exports = Code;