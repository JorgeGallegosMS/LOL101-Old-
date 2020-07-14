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
app.use(middleware.setItemsData);

app.get("/", (req, res) => {
  res.redirect("/champions");
});

app.get('/champions', (req, res) => {
    res.render('index', {
        style: 'home.css',
        champs: res.champs
    })
})


// Displays a single champion
app.get("/champions/:name", (req, res) => {
    const name = utils.capitalize(req.params.name);
    // res.send(res.champs[name]);
<<<<<<< HEAD
    console.log(res.champs[name])
=======
    // console.log(res.champs[name])
>>>>>>> 902e93a143bfa261fe96157514c7b25bc7e1cd3c
    res.render('champion', {
        style: 'champion.css',
        "champion": res.champs[name]
    })
<<<<<<< HEAD
})

=======
  } catch (err) {
    console.error(err);
  }
});
>>>>>>> 902e93a143bfa261fe96157514c7b25bc7e1cd3c

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
<<<<<<< HEAD
        console.log(rotation)
=======
        // console.log(rotation)
>>>>>>> 902e93a143bfa261fe96157514c7b25bc7e1cd3c
    } catch (err) {
        console.error(err)
    }
})

app.get("/search-rank", async (req, res) => {
    // console.log(req.query.query)
    const rank = await utils.getAccountInfo(req.query.query)
    // console.log({rank})
    res.render('search_rank', {rank})
})

app.get('/items', async (req, res) => {
    try {
        res.send(res.items)
    } catch (err) {
        console.error(err)
    }
})  

app.listen(3000, () => console.log(`Listening on port ${port}`));