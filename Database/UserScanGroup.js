const Model = require( './Model' );
const User = require( './User' );
const ScanGroup = require('./ScanGroup');

class UserScanGroup extends Model {
    static get tableName() {
        return 'UserScanGroups';
    }

    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from:'UserScanGroups.user_id',
                    to: 'Users.id'
                }
            },
            group: {
                relation: Model.HasManyRelation,
                modelClass: ScanGroup,
                join: {
                    from:'UserScanGroups.group_id',
                    to: 'ScanGroups.id'
                }
            },
        };
    }
}

module.exports = UserScanGroup;