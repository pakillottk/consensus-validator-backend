module.exports = ( entity, read, write, remove ) => {
    const scopes = []
    if( read ) { 
        scopes.push( entity+'-read' )
    }
    if( write ){ 
        scopes.push( entity+'-write' )
    }   
    if( remove ){
        scopes.push( entity+'-remove' )
    }    
    return scopes    
}