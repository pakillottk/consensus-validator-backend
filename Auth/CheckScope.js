module.exports = ( Entity, method ) => ( req, res, next ) => {
    const scopes = req.res.locals.oauth.token.scopes;
    let op;
    switch (method) {
        case 'put':
        case 'post':
            op = 'write';
            break;
        case 'get':
            op='read';
            break;
        case 'delete':
            op='remove';
            break;
    }
    const required = Entity + '-' + op;
    if( scopes.includes( required ) ) {
        next();
    } else {
        res.status(401).send('Operation not allowed');
    }
}