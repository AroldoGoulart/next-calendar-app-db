const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 1337;
const connection = require("./src/connection")
app.use(express.json());
app.use(cors())

// app.get create route to get.. 
app.post("/api/login", async function(req, res) {
    try {
        const { body: { username, password } } = req
        const sql= `SELECT * FROM LogIn where Username='${username}' and Password='${password}'`
        const con = connection.connect()
        const afterExec = (errDB, resDB, tablesDB) => {
            if(resDB.length  >= 0) {
                console.log(resDB[0])
                res.json({ ...resDB[0] })
            }
            else {
               res.json({ message: 'nothing found' })
            }
        }

        await con.query(sql, (errDB, resDB, tablesDB ) => afterExec(errDB, resDB, tablesDB ))
    }   
    catch(e) {
        res.json({ error: e.message })
    }
    
});

app.get("/api/events", async function(req, res) {
    try {
        const { body: { username, password } } = req
        const sql= ``
        const con = connection.connect()
        const afterExec = (errDB, resDB, tablesDB) => {
            if(resDB.length  >= 0) {
                console.log(resDB[0])
                res.json({ ...resDB[0] })
            }
            else {
               res.json({ message: 'nothing found' })
            }
        }

        await con.query(sql, (errDB, resDB, tablesDB ) => afterExec(errDB, resDB, tablesDB ))
    }   
    catch(e) {
        res.json({ error: e.message })
    }
    
});

app.listen(port, function () {
    const datetime = new Date();
    const message = "Server runnning on Port:- " + port + "/Started at :- " + datetime;
    console.log(message);
});