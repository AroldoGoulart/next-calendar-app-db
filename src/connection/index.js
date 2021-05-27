const mysql = require('mysql');

// create connect of mysql server
function connect () {
    const connection = mysql.createConnection({
        host     : '192.168.25.252',
        user     : 'marketplus',
        password : 'agplus',
        database : 'nsg_grandine',
        insecureAuth: true,
        ssl: {
            rejectUnauthorized: false
        }
    });

    return connection
}

module.exports = {
    connect
}    