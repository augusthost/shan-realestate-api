require('dotenv').config()
const express = require('express');
const app     = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("realestate.db");

app.use(express.json())

// Home
app.get('/test',(req,res)=>{
    db.serialize(() => {
              const query = "SELECT * FROM 'properties'";
              db.all(query, function(err, rows) {
              if (err) throw err;
              res.status(200).send({
                  msg:'sucess',
                  data: rows
              });
            });
    });
})

app.listen(process.env.PORT,()=>{
    console.log('Listen on http://localhost:'+process.env.PORT)
})