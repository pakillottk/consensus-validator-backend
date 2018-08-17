const ModelController = require('./ModelController').class
const Session = require('../Database/Session');
const Deliver = require( '../Database/Deliver' );
const SeatReserve = require( '../Database/SeatReserve' );
const SeatPrice = require( '../Database/SeatPrice' );
const Type = require( '../Database/Type' );
const Code = require( '../Database/Code' );
const LogEntry = require('../Database/LogEntry');
const kue = require( 'kue' );
const crypto = require( 'crypto' );
const { transaction } = require( 'objection' );

class SaleController extends ModelController {
    constructor( model ) {
        super( model );

        this.jobsResponses = {};
        this.queue = kue.createQueue();
        this.queue.process( 'sale', ( job, done ) => {
            this.createSale( 
                job.id, 
                job.data.data, 
                job.data.including, 
                job.data.query, 
                job.data.session, 
                job.data.user, 
                done 
            );
        });
    }

    async getTypeData( type_id ) {
        const type = await Type.query().where( 'id', '=', type_id );
        if( type.length === 0 ) {
            return null;
        }

        return type[0];
    }

    async getAuthSales( type_id, user_id ) {
        let authSales       = await Deliver.query().sum('ammount')
                            .where( 'type_id', '=', type_id )
                            .andWhere( 'user_id', '=', user_id );
        if( authSales.length === 0 ) {
            return 0;
        }
        authSales = authSales[0].sum;

        return authSales
    } 

    async getCodeIds( type_id ) {
        const codesOfType = await Code.query().where( 'type_id', '=', type_id );
        const codesIds = []
        codesOfType.forEach( code => {
            codesIds.push( code.id );
        });

        return codesIds;
    }

    async getSoldTickets( codeIds, user_id ) {
        let soldByMe = await this.model.query().count()
                                .where( 'code_id', 'in', codeIds )
                                .andWhere( 'user_id', '=', user_id );
        soldByMe = soldByMe[0].count;

        return soldByMe;
    }

    getHashCode( userId, typeId ) {
        const hashData = userId + "" + typeId + "" + new Date().toString() + "" + new Date().getTime(); 
        const hashCode = crypto.createHash('md5').update(hashData).digest("hex");
        return 'CNS' + hashCode.substr(0, 9)
    }

    async generateCode( data, trx, zoned=false ) {
        const code = data.code?data.code:this.getHashCode( data.user_id, data.type_id )
        if( zoned ) {
            return Code.query( trx ).insert({
                code: code,
                name: data.name,
                type_id: data.type_id,
                email: data.email,
                validations: 0,
                maxValidations: 1,
                out: true,
                zone_id: data.zone_id,
                row_index: data.row_index,
                seat_index: data.seat_index,
                seat_number: data.seat_number,
                created_at: new Date(),
                updated_at: new Date()
            });
        } else {
            return Code.query( trx ).insert({
                code: code,
                name: data.name,
                type_id: data.type_id,
                email: data.email,
                zone_id: data.zone_id,
                validations: 0,
                maxValidations: 1,
                out: true,
                created_at: new Date(),
                updated_at: new Date()
            });
        }
    }

    /*
        TODO!
    */
   async codeFromPool( data, trx, zoned=false ) {
        //Get the code from the pool
        //const code = 
        //Check if empty, no pooled codes
        //if empty
        return null 
        //Remove code from pool
        //Generate the code and return
        //return this.generateCode( {...data, code:code }, trx, zoned )
   } 

    async createSaleByTypes( id, data, including, query, user, done ) { 
        const res = this.jobsResponses[ id ];
        if( !res ) {
            throw new Error( "There's no response object for this job: " + job );
        }

        let trx;
        try {
            const typeData = await this.getTypeData( data.type_id );
            //Get tickets delivered to user
            const authSales = await this.getAuthSales( data.type_id, data.user_id );
            if( authSales === 0 ) {
                res.status( 401 ).send({error:{message: "User is not allowed to sell this type"}});
            }
            //Get existing codes of type_id
            const codesIds = await this.getCodeIds( data.type_id );
            //Get current sold codes
            const soldByMe = await this.getSoldTickets( codesIds, data.user_id );
            
            //If still under 
            if( parseInt(soldByMe) < parseInt(authSales) ) {
                trx = await transaction.start( this.model.knex() );

                /*const hashData = data.user_id + "" + data.type_id + "" + new Date().toString() + "" + new Date().getTime(); 
                const hashCode = crypto.createHash('md5').update(hashData).digest("hex");
                const newCode = await Code.query( trx ).insert({
                    code: 'CNS' + hashCode.substr(0, 9),
                    name: data.name,
                    type_id: data.type_id,
                    email: data.email,
                    zone_id: data.zone_id,
                    validations: 0,
                    maxValidations: 1,
                    out: true,
                    created_at: new Date(),
                    updated_at: new Date()
                });*/
                const newCode = await this.generateCode( data, trx );
                const sale = await this.model.query( trx ).eager( including ).insert({
                    user_id: data.user_id,
                    code_id: newCode.id,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                const log = await LogEntry.query( trx ).insert({
                    user_id: user.id,
                    session_id: typeData.session_id,
                    level: 'success',
                    msg: user.username + 
                        ' ha vendido una entrada de ' + 
                        typeData.type + ' ' + typeData.price + '€ ' + 
                        '(' +
                        authSales + ' autorizadas. ' +
                        (parseInt(soldByMe) + 1) + ' vendidas.)',
                    date: new Date()
                });

                await trx.commit();

                res.status(200).send( sale );
                done();
            } else {
                if( trx ) {
                    await trx.rollback();
                }

                if( typeData ) {
                    await LogEntry.query().insert({
                        user_id: user.id,
                        session_id: typeData.session_id,
                        level: 'error',
                        msg: user.username + 
                            ' ha intentado vender una entrada de ' + 
                            typeData.type + ' ' + typeData.price + '€ ' +  
                            ' pero no tiene suficientes. (' +
                            (authSales || 0) + ' autorizadas. ' +
                            soldByMe + ' vendidas.)',
                        date: new Date()
                    });
                }

                res.status( 400 ).send({error:{message: "All sold"}});
                done( new Error( "All sold!" ) );
            }  
        } catch( error ) {     
            res.status( 400 ).send( error );
            done( new Error( error ) );
        }

        delete this.jobsResponses[ id ];
    }

    async createSaleByZones( id, data, including, query, session, user, done ) {
        const res = this.jobsResponses[ id ];
        if( !res ) {
            throw new Error( "There's no response object for this job: " + job );
        }       

        //Reserved, attempt to make the sale
        let trx;
        try {
            //Check if is a numerated ticket
            const price = await SeatPrice.query()
                                            .where('session_id', '=', session.id)
                                            .andWhere( 'zone_id', '=', data.zone_id )
                                            .andWhere( 'type_id', '=', data.type_id);
            //No price assigned, can't sell
            if( price.length === 0 ) {
                res.status( 400 ).send( {error:{message:'Seat is not at sale!'}} );
                done( new Error( 'Seat is not at sale!' ) );
                return;
            } else if( !price[0].numerated ) {
                //no numerated, sell as a byTypes flow
                await this.createSaleByTypes( id, data, including, query, user, done );
                return;
            }
            //Check if exists a reserve for user and seat
            const reserve = await SeatReserve.query()
                                                .where('session_id', '=', session.id)
                                                .andWhere( 'zone_id', '=', data.zone_id )
                                                .andWhere( 'seat_row', '=', data.row_index )
                                                .andWhere( 'seat_index', '=', data.seat_index )
                                                .andWhere( 'user_id', '=', user.id )
                                                .andWhere( 'expires_at', '>', new Date() );

            //if no reserve, cancel the selling process
            if( reserve.length === 0 ) {
                res.status( 400 ).send( {error:{message:'Seat not reserved or no by this seller'}} );
                done( new Error( 'Seat not reserved or no by this seller' ) );
            }

            //check if seat it's already sold
            const prev_sale = await Code.query()
                                            .where( 'type_id', '=', data.type_id )
                                            .andWhere( 'zone_id', '=', data.zone_id )
                                            .andWhere( 'row_index', '=', data.row_index )
                                            .andWhere( 'seat_index', '=', data.seat_index );
            if( prev_sale.length > 0 ) {
                res.status( 400 ).send( {error:{message:'Seat already sold...'}} );
                done( new Error( 'Seat already sold...' ) );
            }

            //Create code and sale
            trx = await transaction.start( this.model.knex() );
            /*const hashData = data.user_id + "" + data.type_id + "" + new Date().toString() + "" + new Date().getTime(); 
            const hashCode = crypto.createHash('md5').update(hashData).digest("hex");
            const newCode = await Code.query( trx ).insert({
                code: 'CNS' + hashCode.substr(0, 9),
                name: data.name,
                type_id: data.type_id,
                email: data.email,
                validations: 0,
                maxValidations: 1,
                out: true,
                zone_id: data.zone_id,
                row_index: data.row_index,
                seat_index: data.seat_index,
                seat_number: data.seat_number,
                created_at: new Date(),
                updated_at: new Date()
            });*/
            const newCode = await this.generateCode( data, trx, true );
            const sale = await this.model.query( trx ).eager( including ).insert({
                user_id: user.id,
                code_id: newCode.id,
                created_at: new Date(),
                updated_at: new Date()
            });
            //make reserve never expire, locking the seat
            await SeatReserve.query( trx ).patchAndFetchById( reserve[0].id, {
                user_id: null,
                expires_at: null
            });

            await trx.commit();
            
            res.status( 200 ).send( sale );
            done();
        } catch( error ) {
            if( trx ) {
                await trx.rollback();
            }

            res.status( 400 ).send( error );
            done( new Error( error ) );
        }
    }

    async createSale( id, data, including, query, session, user, done ) {
        const res = this.jobsResponses[ id ];
        switch( session.ticketing_flow ) {
            case 'by_types': {
                await this.createSaleByTypes( id, data, including, query, user, done  );
                break
            }
            case 'by_zones':{
                await this.createSaleByZones( id, data, including, query, session, user, done );
                break
            }
            default:{
                res.status( 400 ).send( {error:{message:'Unknown ticketing flow in Session'}} );
                done( new Error( 'Unknown ticketing_flow' ) );
            }
        }

        delete this.jobsResponses[ id ];
    }

    async create( data, including, query, res ) {
        const user = res.locals.oauth.token.user;        
        
        //Check if ticketoffice is open
        const type = await Type.query().where( 'id', '=', data.type_id );
        if( type.length === 0 ) {
            res.status( 400 ).send( new Error( 'Type not found' ) );
            return;
        }
        const session = await Session.query().where( 'id', '=', type[0].session_id);
        if( session.length === 0 ) {
            res.status( 400 ).send( new Error( 'Session not found' ) );
            return;
        }

        //check if is in refund mode
        if( session[0].refund_mode ) {
            res.status(400).send( 'Sales disabled, refund mode active' );
            return;
        }
        const now = new Date();
        const sellers_locked_at = new Date( session[0].sellers_locked_at );
        const ticketoffice_closed_at = new Date( session[0].ticketoffice_closed_at );
        switch( user.role.role ) {
            case 'seller': {
                if( now > sellers_locked_at ) {
                    res.status( 400 ).send( 'Sales are closed' );
                    return;
                }

                break;
            }

            default: {
                if( now > ticketoffice_closed_at ) {
                    res.status( 400 ).send( 'Sales are closed' );
                    return;
                }

                break;
            }
        }

        //If ticketoffice is open for the user, attempt to sell
        const jobData =  { data, including: including, query: query, session: session[0], user: {id: user.id, username: user.username} };
        const job = this.queue.create( 'sale', jobData ).removeOnComplete( true ).save(
            ( error ) => {  
                if( !error ){
                    this.jobsResponses[ job.id ] = res;
                    return;
                } 
                res.status( 400 ).send( error );
            }
        );
    }

    async delete( id ) {
        let trx;
        try {
            trx = await transaction.start( this.model.knex() );

            const toDelete = await this.model.query().eager('[code]').findById( id );
            //delete the reserve if is a zoned sale
            if( toDelete.code.zone_id && toDelete.code.row_index && toDelete.code.seat_index ) {
                await SeatReserve.query( trx ).delete()
                                    .where( 'zone_id', '=', toDelete.code.zone_id )
                                    .andWhere( 'seat_row', '=', toDelete.code.row_index )
                                    .andWhere( 'seat_index', '=', toDelete.code.seat_index );
            }

            const codeId = toDelete.code_id
            //Delete the sale
            const deleted = await this.model.query( trx ).deleteById( id );
            //Delete the code
            await Code.query( trx ).deleteById( codeId )

            await trx.commit();

            return { deleted_at: new Date(), deleted_id: id };
        } catch( error ) {
            await trx.rollback();
            throw { code: error.code, message: error.detail };
        }
    }
}

module.exports = ( model ) => new SaleController( model );