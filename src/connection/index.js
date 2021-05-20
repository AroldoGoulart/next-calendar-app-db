const mysql = require('mysql');

function connect () {
    const connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'password',
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