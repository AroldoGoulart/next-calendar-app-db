const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 1337;
const connection = require("./src/connection")
app.use(express.json());
app.use(cors())

// app.get or post create route to frontend get data
app.post("/api/login", async function(req, res) {
    try {
        let { body: { username, password } } = req
        const sql= `SELECT * FROM LogIn where Username='${username}' and BINARY Password='${password}'`
        const con = connection.connect()
        console.log(sql)
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

app.post("/api/event", async function(req, res) {
    try {
        let sql = ""
        // get from the request  json data

        // id = id of user
        // type = date or cerca
        // data = cerca string or date string
        // table = repair or perizie
        const { body: { id, type = "date", data, table = "repair" } } = req

        if(table == "repair" || !type == "date" ) {
            sql= `SELECT Incarichi.ID,'R' as tipo,
            DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y''.%H-%i') as Appuntamento,
            DATE_FORMAT(Incarichi.Data_appuntamento, '%H-%i') as ora, 
            Targa,Modello, Intestatario,insured_party.company_name ,
            repairyards.RagioneSociale as Carrozzeria,NomeCompleto,  
            statuses.code as codicestato,statuses.description as descstato, 
            a_condizione_r as condizione ,cliente_id, 
            Get_NumDocs(Get_id_profiloPratica( Incarichi.ID, cliente_id), 
            Incarichi.ID,'R') as numdocumenti,tel1_cantiere as telCarrozzeria,
            latitude,longitude,Incarichi.IDoperatore 
            From Incarichi 
            LEFT JOIN insured_party on insured_party.ID = cliente_id 
            LEFT JOIN LogIn on LogIn.ID = Incarichi.IDoperatore 
            LEFT JOIN statuses on statuses.ID = Incarichi.status_inspection 
            LEFT JOIN repairyards on repairyards.ID = Incarichi.repairyard_id
            WHERE a_condizione_r in ('A','D','V')  AND Incarichi.IDoperatore  = ${id}`
        }
  
        if(!type == "date" || table == "perizie") {
            // fix me 
            sql = `${sql} `
        }
        
        if(type == "date") {
            sql = `${sql} AND DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y')= '${data}'`
        }
        else {
            sql = `${sql} AND (
                Targa LIKE '%" ${data}"%' 
                OR Modello LIKE '%"${data}"%' 
                OR Intestatario LIKE '%"${data}"%' 
                OR insured_party.company_name LIKE '%"${data}"%' 
                OR repairyards.RagioneSociale LIKE '%"${data}"%'     
                OR NomeCompleto LIKE '%"${data}"%'
            )`
        }
        // create connection with db
        const con = connection.connect()

        // execute connection with data passed
        const afterExec = (errDB, resDB, tablesDB) => {
            // if has any response, return it
            console.log(sql)
            if(resDB) {
                console.log(resDB)
                res.json({ ...resDB })
            }
            else {
               res.json({ message: 'nothing found' })
            }
        }
        // execute query and pass values to afterExec function
        await con.query(sql, (errDB, resDB, tablesDB ) => afterExec(errDB, resDB, tablesDB ))
    }   
    catch(e) {
        // if any error ocurred in the code, handler the exception
        res.json({ error: e.message })
    }
    
});

app.post("/api/calendar", async function (req, res) {
    try {
        const { body: { id, year } } = req
        const sql= `SELECT dataestesa,giorno,sum(numperizie) as nump, sum(numriparazioni) as numr, sum(riparazioniAttive) as numAttiveR,sum(perizieAttive) as numAttiveP
            FROM (SELECT DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y') as dataestesa,
            DATE_FORMAT(Incarichi.Data_appuntamento, '%d') as giorno,
            0 as numperizie, COUNT(Incarichi.ID)  
            as numriparazioni, SUM( IF ( a_condizione_r = 'A', 1, 0 ) )
            as riparazioniAttive,
            0 as perizieAttive
            From Incarichi LEFT JOIN statuses on statuses.ID = Incarichi.status_inspection
            WHERE month(Incarichi.Data_appuntamento)<= 12
            AND year(Incarichi.Data_appuntamento)= ${year} 
            AND a_condizione_r in ('A','D','V') 
            AND Incarichi.IDoperatore  = ${id}
            GROUP BY  DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y')
            UNION SELECT  DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%d-%m-%y') as dataestesa,
            DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%d') as giorno, 
            COUNT(Incarichi.ID)  as numperizie,0 as numriparazioni,
            0 as riparazioniAttive,SUM( IF ( a_condizione_p = 'A', 1, 0 ) )  as perizieAttive
            From carrozzeria_perizia LEFT JOIN Incarichi ON  
            Incarichi.ID = carrozzeria_perizia.incarchi_id LEFT JOIN statuses ON statuses.ID = Incarichi.status_inspection
            WHERE month(carrozzeria_perizia.dataappuntamento_perizia)<= 12 AND
            year(carrozzeria_perizia.dataappuntamento_perizia)= ${year} AND a_condizione_p in ('A','D','V')
            AND carrozzeria_perizia.idOperatore_perizia  = ${id}
            GROUP BY  DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%d-%m-%y')) as elenco
            GROUP BY dataestesa  ORDER BY dataestesa`

        console.log(sql)
        const con = connection.connect()
        const afterExec = (errDB, resDB, tablesDB) => {
            console.log(tablesDB, resDB)
            if(resDB) {
                console.log(resDB, tablesDB)
                res.json({ ...resDB })
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
})

app.listen(port, function () {
    const datetime = new Date();
    const message = "Server runnning on Port:- " + port + "/Started at :- " + datetime;
    console.log(message);
});