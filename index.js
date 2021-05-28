const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 5353;
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
            console.log("response", resDB)
            console.log("tables", tablesDB)
            console.log('errors', errDB)

            if(resDB) {
                console.log(resDB)
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

// app.get or post create route to frontend get data
app.get("/api/test", async function(req, res) {
        res.json({ error: "all right, test is success, just change the port to public" })
});

app.post("/api/allEvent", async function(req, res) {
    const { body: { data } } = req

    let sql = `SELECT id as id_incarico,tipo,ora,Targa,Modello, Intestatario, company_name , RagioneSociale,NomeCompleto, codicestato,descstato,condizione ,
    cliente_id,numdocumenti,telCarrozzeria,latitude,IDoperatore, id_profilo FROM (SELECT Incarichi.ID,'R' as tipo,
    DATE_FORMAT(Incarichi.Data_appuntamento, '%H-%i') as ora, Targa,Modello,
     Intestatario,insured_party.company_name , repairyards.RagioneSociale,NomeCompleto,  statuses.code as codicestato,
     statuses.description as descstato, a_condizione_r as condizione ,cliente_id,Get_NumDocs(Get_id_profiloPratica( Incarichi.ID,
     cliente_id), Incarichi.ID,'R') as numdocumenti,Get_id_profiloPratica( Incarichi.ID,
     cliente_id) as id_profilo,tel1_cantiere as telCarrozzeria,latitude,Incarichi.IDoperatore
     From Incarichi LEFT JOIN insured_party on insured_party.ID = cliente_id LEFT JOIN LogIn on LogIn.ID = Incarichi.IDoperatore
     LEFT JOIN statuses on statuses.ID = Incarichi.status_inspection LEFT JOIN repairyards on repairyards.ID = Incarichi.repairyard_id
     WHERE DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y')= ${data} AND a_condizione_r in ('A','D','V') UNION SELECT
     Incarichi.ID,'P'as tipo, DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%H-%i') as ora, Targa,Modello,
    Intestatario,insured_party.company_name , repairyards.RagioneSociale,NomeCompleto,  statuses.code as codicestato,
    statuses.description as descstato, a_condizione_p as condizione ,cliente_id, Get_NumDocs(Get_id_profiloPratica( Incarichi.ID,
    cliente_id) , Incarichi.ID,'P') as numdocumenti,Get_id_profiloPratica( Incarichi.ID,
     cliente_id) as id_profilo,tel1_cantiere as telCarrozzeria,latitude,Incarichi.IDoperatore
    From carrozzeria_perizia LEFT JOIN Incarichi ON  Incarichi.ID = carrozzeria_perizia.incarchi_id
    LEFT JOIN insured_party ON insured_party.ID = cliente_id LEFT JOIN statuses ON statuses.ID = Incarichi.status_inspection
    LEFT JOIN repairyards ON repairyards.ID = carrozzeria_perizia.repaiyard_id_perizia
    LEFT JOIN LogIn as operatoriperizia ON operatoriperizia.ID =  carrozzeria_perizia.idOperatore_perizia
    WHERE DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%d-%m-%y') = ${data}
    AND a_condizione_p in ('A','D','V')) as elenco ORDER BY ora`

    // create connection with db
    const con = connection.connect()

    // execute connection with data passed
    const afterExec = (errDB, resDB, tablesDB) => {
        // if has any response, return it
        console.log(sql)
        if(resDB) {

            console.log("start where")
           // console.log(resDB)
            res.json({ ...resDB })
        }
        else {
            console.log("not found", tablesDB, resDb, errDb)
           res.json({ message: 'nothing found' })
        }
    }
    // execute query and pass values to afterExec function
    await con.query(sql, (errDB, resDB, tablesDB ) => afterExec(errDB, resDB, tablesDB ))
})

app.post("/api/event", async function(req, res) {
    try {
        let sql = ""
        // get from the request  json data
        // id = id of user
        // type = date or cerca
        // data = cerca string or date string
        // table = repair or perizie
        const { body: { id, type = "date", data, table = "repair" } } = req

        // if you are searching for repair
        if(table == "repair") {
            console.log("passou aq")
            sql= `SELECT Incarichi.ID as ID_incarichi,
            'R' as tipo,
            DATE_FORMAT(Incarichi.Data_appuntamento, '%H-%i') as ora, 
            Targa,Modello, Intestatario,insured_party.company_name , 
            repairyards.RagioneSociale,NomeCompleto,  
            statuses.code as codicestato,
            statuses.description as descstato, a_condizione_r as 
            condizione ,cliente_id,Get_NumDocs(Get_id_profiloPratica( Incarichi.ID,
            cliente_id), Incarichi.ID,'R') as 
            numdocumenti,Get_id_profiloPratica( Incarichi.ID,
            cliente_id) as id_profilo,tel1_cantiere as 
            telCarrozzeria,latitude,Incarichi.IDoperatore
            From Incarichi LEFT JOIN insured_party on insured_party.ID = cliente_id 
            LEFT JOIN LogIn on LogIn.ID = Incarichi.IDoperatore
            LEFT JOIN statuses on statuses.ID = Incarichi.status_inspection LEFT 
            JOIN repairyards on repairyards.ID = Incarichi.repairyard_id
            WHERE a_condizione_r in  ('A','D','V')  AND Incarichi.IDoperatore  = ${id}
            `
        }

        // if you are searching for perizie
        if(table == "perizie") {
            sql = `SELECT Incarichi.ID as ID_incarichi,
            'P' as tipo,
            DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%d-%m-%y''.%H-%i') 
            as Appuntamento,
            DATE_FORMAT(carrozzeria_perizia.dataappuntamento_perizia, '%H-%i') as ora, Targa,Modello, Intestatario,insured_party.company_name ,
            repairyards.RagioneSociale as Carrozzeria,NomeCompleto,  
            statuses.code as codicestato,statuses.description as descstato, a_condizione_p as condizione ,cliente_id, 
            Get_NumDocs(Get_id_profiloPratica( Incarichi.ID, cliente_id), Incarichi.ID,'P') as numdocumenti,tel1_cantiere as telCarrozzeria,
            latitude,longitude,Incarichi.IDoperatore 
            FROM  carrozzeria_perizia
            LEFT JOIN Incarichi ON Incarichi.ID = carrozzeria_perizia.incarchi_id
            LEFT JOIN insured_party ON insured_party.ID = cliente_id
            LEFT JOIN statuses ON statuses.ID = Incarichi.status_inspection
            LEFT JOIN repairyards ON repairyards.ID = carrozzeria_perizia.repaiyard_id_perizia
            LEFT JOIN LogIn AS operatoriperizia ON     operatoriperizia.ID = carrozzeria_perizia.idOperatore_perizia
            WHERE   a_condizione_p in  ('A','D','V')  AND carrozzeria_perizia.idOperatore_perizia  = ${ID}
            `
        }
        
        if(type == "date") {
            sql = `${sql} AND DATE_FORMAT(Incarichi.Data_appuntamento, '%d-%m-%y')= '${data}'`
        }
        else {
            sql = `${sql} AND (
                Targa LIKE '% ${data}%' 
                OR Modello LIKE '%${data}%' 
                OR Intestatario LIKE '%${data}%' 
                OR insured_party.company_name LIKE '%${data}%' 
                OR repairyards.RagioneSociale LIKE '%${data}%'     
                OR NomeCompleto LIKE '%${data}%'
            )`
        }
        // create connection with db
        const con = connection.connect()

        // execute connection with data passed
        const afterExec = (errDB, resDB, tablesDB) => {
            // if has any response, return it
            console.log(sql)
            if(resDB) {
                console.log("start where")
               // console.log(resDB)
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
                //console.log(resDB, tablesDB)
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

app.post("/api/createDocument", async function (req, res) {
    try {
        const { body: { ID_incarico, ID_profilo, tipo } } = req
        // add required documents
        const sql= `INSERT INTO Join_Incarichi_AnagDoc_x_2 
        (id_AnagDocumenti,id_Incarichi)
        SELECT id_AnagDocumenti, ${ID_incarico} as 
        id_Incarichi from Join_DocProf_2_5
        Where id_AnagProfilo = ${ID_profilo}  and 
        tipoIntervento = ${tipo}
        and not exists (select ${ID_incarico} from 
        Join_Incarichi_AnagDoc_x_2 t2
        where t2.id_AnagDocumenti = id_AnagDocumenti 
        AND t2.id_Incarichi = id_Incarichi );
        `
        // list required documents
        const sql2= `SELECT J.id as id_Join, documento, 
        D.id_DocumentTypes,count(DJ.id) as caricati FROM Join_Incarichi_AnagDoc_x_2 J
        LEFT JOIN 2_AnagDocumenti D ON D.id = J.id_AnagDocumenti
        LEFT JOIN Doc_Join_Incarichi_AnagDoc_x_2 DJ on DJ.id_Join = J.id
        WHERE id_Incarichi = ${ID_incarico}
        GROUP BY J.id, documento, D.id_DocumentTypes
        `
        const con = connection.connect()
        const afterExec = (errDB, resDB, tablesDB) => {
            console.log(tablesDB, resDB)
            if(resDB) {
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

app.post("/api/listDocument", async function (req, res) {
    try {
        const { body: { ID_incarico } } = req
        // list required documents
        const sql= `SELECT J.id as id_Join, documento, 
        D.id_DocumentTypes,count(DJ.id) as caricati FROM Join_Incarichi_AnagDoc_x_2 J
        LEFT JOIN 2_AnagDocumenti D ON D.id = J.id_AnagDocumenti
        LEFT JOIN Doc_Join_Incarichi_AnagDoc_x_2 DJ on DJ.id_Join = J.id
        WHERE id_Incarichi = ${ID_incarico}
        GROUP BY J.id, documento, D.id_DocumentTypes
        `
        const con = connection.connect()
        const afterExec = (errDB, resDB, tablesDB) => {
            console.log(tablesDB, resDB)
            if(resDB) {
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