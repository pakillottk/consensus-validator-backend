const Model = require( './Model' );
const Recint = require('./Recint');

class RecintZone extends Model {
    static get tableName() {
        return 'RecintZones';
    }

    static get relationMappings() {
        return {
            recint: {
                relation: Model.BelongsToOneRelation,
                modelClass: Recint,
                join: {
                    from:'RecintZones.recint_id',
                    to: 'Recints.id'
                }
            }
        }
    };
}

module.exports = RecintZone;