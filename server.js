require('dotenv').config()
const port = process.env.PORT
const express = require('express')
const app = express()
const fetch = require('node-fetch')
const exphbs = require('express-handlebars')
const utils = require('./utils')

app.use(express.json())

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))

let api_version

utils.getVersion()
    .then(version => api_version = version
    ).catch(err => console.error(err)
    )

app.get('/', (req, res) => {
    res.redirect('/champions')
})

// Displays all champions
app.get('/champions', async (req, res) => {
    try {
        // const version = await getVersion()
        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${api_version}/data/en_US/champion.json`)
        const data = await response.json()
        const champions = data.data
        const champsList = []
        const champs = {}

        for (champion in champions) {
            champsList.push([champions[champion]['name'], champions[champion]['id']])
        }

        champsList.sort()
        champsList.forEach(champ => {
            champs[champ[0]] = champ[1]
        })
        // JSON data
        // res.send(champs)
        res.render('home', { champs })
    } catch (err){
        console.error(err)
    }
})

// Displays a single champion
app.get('/champions/:name', async (req, res) => {
    try {
        // const version = await getVersion()
        const name = utils.capitalize(req.params.name)
        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${api_version}/data/en_US/champion/${name}.json`)
        const data = await response.json()
        const champion = data.data
        // JSON data
        res.send(champion)
        // res.render('champion', { name })
    } catch (err){
        console.error(err)
    }
})

app.listen(port, () => console.log(`Listening on port ${port}`))