const Model = require( './Model' );
const Company = require('./Company');
const Recint = require('./Recint');

class Session extends Model {
    static get tableName() {
        return 'Sessions';
    }

    static get relationMappings() {
        return {
            company: {
                relation: Model.BelongsToOneRelation,
                modelClass: Company,
                join: {
                    from: 'Sessions.company_id',
                    to: 'Companies.id'
                }
            },
            recint: {
                relation: Model.BelongsToOneRelation,
                modelClass: Recint,
                join: {
                    from: 'Sessions.recint_id',
                    to: 'Recints.id'
                }
            }
        }
    };

    static get files() {
        return {
            logos_img: true,
            header_img: true
        }
    }

    static get columns() {
        return [ 
            'id',
            'name',
            'location',
            'recint',
            'date',
            'sellers_locked_at',
            'ticketoffice_closed_at', 
            'company_id',
            'created_at', 
            'updated_at' 
        ];
    }
}

module.exports = Session;