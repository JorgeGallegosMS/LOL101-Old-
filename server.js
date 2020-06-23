require('dotenv').config()
const port = process.env.PORT
const express = require('express')
const app = express()
const fetch = require('node-fetch')
const exphbs = require('express-handlebars')
const utils = require('./utils')
const middleware = require('./middleware')

app.use(express.json())

app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.use(middleware.getAPIVersion)

// Placeholder routes for Front-End
app.get('/', (req, res) => {
    res.render('index', {
        style: 'home.css'
    })
})

app.get('/champions', (req, res) => {
    res.render('champion', {
        style: 'champion.css'
    })
})

// // Displays all champions
// app.get('/champions', async (req, res) => {
//     try {
//         utils.getChampionsList(res.version)
//         const champs = {}

//         champsList.sort()
//         champsList.forEach(champ => {
//             champs[champ[0]] = champ[1]
//         })
//         // JSON data
//         res.send(champs)
//         // res.render('home', { champs })
//     } catch (err){
//         console.error(err)
//     }
// })

// Displays a single champion
// app.get('/champions/:name', async (req, res) => {
//     try {
//         const name = utils.capitalize(req.params.name)
//         const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${res.version}/data/en_US/champion/${name}.json`)
//         const data = await response.json()
//         const champion = data.data
//         // JSON data
//         res.send(champion)
//         // res.render('champion', { name, api_version })
//     } catch (err){
//         console.error(err)
//     }
// })

app.listen(3000, () => console.log(`Listening on port ${port}`))