const Password = require( 'objection-password' );
const Model = require( './Model' );
const Role = require( './Role' );

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
            }
        }
    };
}

module.exports = User;