const ModelController = require('./ModelController').class
const Type = require( '../Database/Type' );
const User = require('../Database/User');
const LogEntry = require('../Database/LogEntry');

const { transaction } = require( 'objection' );

class DeliverController extends ModelController {
    async getUserData( user_id ) {
        const user = await User.query().where( 'id', '=', user_id );
        if( user.length > 0 ) {
            return user[0];
        }
        return null;
    }

    async getTypeData( type_id ) {
        const type = await Type.query().where( 'id', '=', type_id );
        if( type.length > 0 ) {
            return type[0];
        }
        return null;
    }

    getAvailableAmmount( type ) {
        let availableAmmount = 0;
        if( type ) {
            availableAmmount = type.ammount;
        }

        return availableAmmount;
    }

    async getTotalAmmount( type_id ) {
        const totalAmmountQuery = await this.model.query()
                            .sum('ammount')
                            .where( 'type_id', '=', type_id );
        
        let totalAmmount = 0;
        if( totalAmmountQuery.length > 0 ) {
            totalAmmount = totalAmmountQuery[0].sum;
        }

        return totalAmmount || 0;
    }

    async create( data, including, query ) {
        const userId = data.req_user_id;
        delete data.req_user_id;

        const typeData = await this.getTypeData( data.type_id );
        const userToDeliver = await this.getUserData( data.user_id );
        const availableAmmount = this.getAvailableAmmount( typeData );
        const totalAmmount = await this.getTotalAmmount( data.type_id );

        const canDeliver = availableAmmount >= (parseInt(totalAmmount) + parseInt(data.ammount));
        if( canDeliver ) {
            let trx;
            try { 
                trx = await transaction.start( this.model.knex() );

                const deliver = await this.model.query( trx ).eager( including ).insert({
                    ...data, 
                    created_at: new Date(),
                    updated_at: new Date()
                });
                
                await LogEntry.query( trx ).insert({
                    user_id: userId,
                    session_id: typeData.session_id,
                    level: 'success',
                    msg: 'Entregadas ' + data.ammount + 
                        ' entradas de ' + typeData.type + ' ' + typeData.price + '€ para ' +
                        userToDeliver.username + '. (total entregadas: ' +
                        (parseInt(totalAmmount) + parseInt(data.ammount)) + '. hay: ' + availableAmmount + ')',
                    date: new Date()
                });
                
                await trx.commit();

                return deliver;
            } catch( error ) {
                if( trx ) {
                    await trx.rollback();
                }                          
                throw { code: error.code, message: error.detail };
            }
        } else {            
            await LogEntry.query().insert({
                user_id: userId,
                session_id: typeData.session_id,
                level: 'error',
                msg: 'Se intentó entregar ' + data.ammount + 
                    ' entradas de ' + typeData.type + ' ' + typeData.price + '€ para ' +
                    userToDeliver.username + ' pero no hay suficientes. (Disponibles ' + 
                    availableAmmount + ')',
                date: new Date()
            });
            throw { code: 400, message: "There are not enough tickets to deliver." };
        }
    }

    async update( id, data, including ) {
        const userId = data.req_user_id;
        delete data.req_user_id;

        const oldDeliver = await this.model.query().where( 'id', '=', id );
        if( oldDeliver.length <= 0 ) {
            throw { code: 404, message: "Deliver not found." };
        }
        const oldAmmount = oldDeliver[0].ammount;
        const typeId = data.type_id ? data.type_id : oldDeliver[0].type_id;
        const typeData = await this.getTypeData( typeId );
        const availableAmmount = this.getAvailableAmmount( typeData );
        const totalAmmount = await this.getTotalAmmount( typeId );
        
        const canDeliver = availableAmmount >= (parseInt(totalAmmount) - parseInt( oldAmmount ) + parseInt(data.ammount));
        if( canDeliver ) {
            try {
                return await this.model.query().eager( including ).patchAndFetchById( id, {...data, updated_at: new Date()} );
            } catch( error ) {
                throw { code: error.code, message: error.detail };
            }
        } else {
            throw { code: 400, message: "There are not enough tickets to deliver." };
        }
    }
}

module.exports = ( model ) => new DeliverController( model );