const Model = require( './Model' );
const Company = require('./Company');

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
            }
        }
    };

    static get files() {
        return {
            logos_img: true,
            header_img: true
        }
    }
}

module.exports = Session;