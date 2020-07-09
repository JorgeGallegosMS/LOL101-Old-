const utils = require('../helpers/utils')
const fs = require('fs')

const setAPIVersion = async (req, res, next) => {
    try {
        const version = await utils.getVersion()
        res.version = version
        next()
    } catch (err) {
        console.error(err)
    }
}

const setChampionsData = async (req, res, next) => {
    try {
        let champs = JSON.parse(fs.readFileSync('champions.json'))
        
            // Rewrites champions.json file if the Riot API version changes
            if (res.version != champs.version){
                const data = await utils.getChampionsData(res.version)
                fs.writeFileSync('./champions.json', JSON.stringify(data, null, 4))
                champs = JSON.parse(fs.readFileSync('champions.json'))
            }
    
        res.champs = champs
        next()
    } catch (err) {
        console.error(err)
    }
}

const setItemsData = async (req, res, next) => {
    try {
        let items = JSON.parse(fs.readFileSync('items.json'))
    
            // Rewrites champions.json file if the Riot API version changes
            if (res.version != items.version){
                const data = await utils.getItemsData(res.version)
                fs.writeFileSync('./items.json', JSON.stringify(data, null, 4))
                items = JSON.parse(fs.readFileSync('items.json'))
            }
    
        res.items = items
        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    setAPIVersion,
    setChampionsData,
    setItemsData
}