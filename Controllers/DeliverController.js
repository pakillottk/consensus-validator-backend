const ModelController = require('./ModelController').class
const Type = require( '../Database/Type' )

class DeliverController extends ModelController {
    async getAvailableAmmount( type_id ) {
        const availableQuery = await Type.query().where( 'id', '=', type_id );
        let availableAmmount = 0;
        if( availableQuery.length > 0 ) {
            availableAmmount = availableQuery[0].ammount;
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
        const availableAmmount = await this.getAvailableAmmount( data.type_id );
        const totalAmmount = await this.getTotalAmmount( data.type_id );

        const canDeliver = availableAmmount >= (parseInt(totalAmmount) + parseInt(data.ammount));
        if( canDeliver ) {
            try { 
                const deliver = await this.model.query().eager( including ).insert({
                    ...data, 
                    created_at: new Date(),
                    updated_at: new Date()
                });

                return deliver;
            } catch( error ) {
                throw { code: error.code, message: error.detail };
            }
        } else {
            throw { code: 400, message: "There are not enough tickets to deliver." };
        }
    }

    async update( id, data, including ) {
        const oldDeliver = await this.model.query().where( 'id', '=', id );
        if( oldDeliver.length <= 0 ) {
            throw { code: 404, message: "Deliver not found." };
        }
        const oldAmmount = oldDeliver[0].ammount;
        const typeId = data.type_id ? data.type_id : oldDeliver[0].type_id;
        const availableAmmount = await this.getAvailableAmmount( typeId );
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