const Model = require( './Model' );
const User = require( './User' );

class OAuthToken extends Model {
    static get tableName() {
        return 'oauth_tokens';
    }
    
    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from:'oauth_tokens.user_id',
                    to: 'Users.id'
                }
            }
        }
    };
}

module.exports = OAuthToken;