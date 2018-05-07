const { Model } = require( 'objection' );
const Knex = require( 'knex' );
const config = require( '../knexfile' )[ 'development' ]

const knex = Knex( config );
Model.knex( knex );
Model.files = {};

module.exports = Model;