require('dotenv').config()
const port = process.env.PORT || 3000
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
app.use(middleware.setItemsData);
app.use(middleware.setSpellsData);
app.use(middleware.setRunesData);


app.get("/", (req, res) => {
  res.redirect("/champions1");
});

app.get('/champions1', (req, res) => {
    res.render('index', {
        style: 'home.css',
        champs: res.champs
    })
})

app.get('/dev1', (req, res) => {
    res.render('champion', {
        style: 'champion.css',
        champs: res.champs
    })
})

// // Displays all champions
// app.get('/champions', async (req, res) => {
//     try { 
//         res.send(res.champs)
//     } catch (err){
//         console.error(err)
//     }
// })

// Displays a single champion
app.get("/champions/:name", (req, res) => {
  try {
    const name = utils.capitalize(req.params.name.toLowerCase());
    // res.send(res.champs[name]);
    // console.log(res.champs[name])
    res.render('champion', {
        style: 'champion.css',
        "champion": res.champs[name]
    })
  } catch (err) {
    console.error(err);
  }
});

app.get("/rotation", async (req, res) => {
    try {
        // const freeRotation = {
        //     "type": "Free Rotation"
        // }
    
        const rotation = await utils.getChampionRotations(res.champs)
    
        // rotation.forEach(champion => {
        //     for (champ in res.champs) {
        //         if (res.champs[champ].hasOwnProperty('id')){
        //             if (champion.champ_id == res.champs[champ].id){
        //                 freeRotation[champ] = res.champs[champ]
        //             }
        //         }
        //     }
        // })
        res.render('rotation', {
            style: 'rotation.css',
            freeRotation: rotation
        })
        // console.log(rotation)
    } catch (err) {
        console.error(err)
    }
})

app.get("/search-rank", async (req, res) => {
    // console.log(req.query.query)
    const rank = await utils.getAccountInfo(req.query.query)
    console.log({rank})
    res.render('search_rank', {rank})
})
app.get("/spells", async (req, res) => {
    try {
        res.send(res.spells)
    } catch (err) {
        console.error(err)
    }
})  

app.get('/items', async (req, res) => {
    try {
        res.send(res.items)
    } catch (err) {
        console.error(err)
    }
})  

app.get('/runes', async (req, res) => {
    try {
        res.send(res.runes)
    } catch (err) {
        console.error(err)
    }
})  

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;