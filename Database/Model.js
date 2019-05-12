const { Model } = require( 'objection' );
const Knex = require( 'knex' );
const config = require( '../knexfile' )[ 'development' ]
const Field = require('./Queries/Engine/Field');

const knex = Knex( config );
Model.knex( knex );
Model.files = {};
Model.listAllFields = ( model ) => {
    return [new Field( model.tableName, '*' )];
}
Model.listFields = ( model, filter=[], exclude=true ) => {
    return model.columns
            .filter( column => { if(filter.includes( column )){ return !exclude } return exclude } )
            .map( column => new Field( model.tableName, column ));
}
Model.getField = ( model, field ) => {
    if(model.columns.includes(field))
    {
        return new Field(model.tableName, field)
    }

    return null
}
module.exports = Model;