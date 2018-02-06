const Model = require( './Model' );

class OAuthClient extends Model {
    static get tableName() {
        return 'oauth_clients';
    }
}

module.exports = OAuthClient;