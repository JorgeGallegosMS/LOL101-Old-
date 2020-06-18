require('dotenv').config()
const port = process.env.PORT
const express = require('express')
const app = express()
const fetch = require('node-fetch')
const exphbs = require('express-handlebars')
const utils = require('./helpers/utils')
const middleware = require('./middleware/middleware')

app.use(express.json())

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.use(middleware.getAPIVersion)

app.get('/', (req, res) => {
    res.redirect('/champions')
})

// Displays all champions
app.get('/champions', async (req, res) => {
    try {
        const champs = await utils.getChampionsData(res.version)
        // JSON data
        res.send(champs)
        // res.render('home', { champs })
    } catch (err){
        console.error(err)
    }
})

// Displays a single champion
app.get('/champions/:name', async (req, res) => {
    try {
        const name = utils.capitalize(req.params.name)
        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${res.version}/data/en_US/champion/${name}.json`)
        const data = await response.json()
        const champion = data.data
        // JSON data
        res.send(champion)
        // res.render('champion', { name, api_version })
    } catch (err){
        console.error(err)
    }
})

app.listen(port, () => console.log(`Listening on port ${port}`))