module.exports = {
    PROJECT_DIR: '', //The root dir of the server
    protocol: 'http', //Serve on http or https
    serverOptions: { //Server config
        ssl: {      
            keyFile: '', //path to the ssl_key
            certFile: '', //path to the ssl_cert
            chainFile: '', //path to ssl_chain (pem)
        }
    }
}