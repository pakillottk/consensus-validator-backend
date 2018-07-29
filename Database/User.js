const Password = require( 'objection-password' );
const Model = require( './Model' );
const Role = require( './Role' );
const Company = require( './Company' );

class User extends Password()( Model ) {
    static get tableName() {
        return 'Users';
    }

    static get relationMappings() {
        return {
            role: {
                relation: Model.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from:'Users.role_id',
                    to: 'Roles.id'
                }
            },
            company: {
                relation: Model.BelongsToOneRelation,
                modelClass: Company,
                join: {
                    from: 'Users.company_id',
                    to: 'Companies.id'
                }
            }
        }
    };

    static get columns() {
        return ['id','username','password','role_id','company_id', 'created_at', 'updated_at']
    }
}

module.exports = User;