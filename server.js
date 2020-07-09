require('dotenv').config()
const port = process.env.PORT || 5000
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const utils = require('./helpers/utils')
const middleware = require('./middleware/middleware')

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.use(middleware.setAPIVersion);
app.use(middleware.setChampionsData);

app.get("/", (req, res) => {
  res.redirect("/champions");
});

app.get('/dev', (req, res) => {
    res.render('index', {
        style: 'home.css',
        champs: res.champs
    })
})

// Displays all champions
app.get('/champions', async (req, res) => {
    try { 
        res.send(res.champs)
    } catch (err){
        console.error(err)
    }
})

// Displays a single champion
app.get("/champions/:name", (req, res) => {
  try {
    const name = utils.capitalize(req.params.name);
    res.send(res.champs[name]);
  } catch (err) {
    console.error(err);
  }
});

app.get("/rotation", async (req, res) => {
    try {
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
    } catch (err) {
        console.error(err)
    }
})

app.listen(3000, () => console.log(`Listening on port ${port}`));