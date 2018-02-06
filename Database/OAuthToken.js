const Model = require( './Model' );

class OAuthToken extends Model {
    static get tableName() {
        return 'oauth_tokens';
    }
}

module.exports = OAuthToken;