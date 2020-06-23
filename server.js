require('dotenv').config()
const port = process.env.PORT
const express = require('express')
const app = express()
const fetch = require('node-fetch')
const exphbs = require('express-handlebars')
const utils = require('./helpers/utils')
const middleware = require('./middleware/middleware')
const fs = require('fs')

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.use(middleware.setAPIVersion);
app.use(middleware.setChampionsData);

app.get("/", (req, res) => {
  res.redirect("/champions");
});

// Displays all champions
app.get('/champions', async (req, res) => {
    try {
        // JSON data
        res.send(res.champs)
        // res.render('home', { champs })
    } catch (err){
        console.error(err)
    }
})

// Displays a single champion
app.get("/champions/:name", (req, res) => {
  try {
    const name = utils.capitalize(req.params.name);
    // JSON data
    res.send(res.champs[name]);
    // res.render('champion', { name, api_version })
  } catch (err) {
    console.error(err);
  }
});

app.get("/rotation", async (req, res) => {

    const freeRotation = {
        "type": "Free Rotation"
    }

    const rotation = await utils.getChampionRotations(res.champs)

    rotation.forEach(champion => {
        for (champ in res.champs) {
            if (res.champs[champ].hasOwnProperty('id')){
                if (champion.champ_id == res.champs[champ].id){
                    freeRotation[champ] = res.champs[champ]
                }
            }
        }
    })
    res.send(freeRotation)
})

app.listen(port, () => console.log(`Listening on port ${port}`));
