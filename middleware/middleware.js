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

module.exports = {
    setAPIVersion,
    setChampionsData
}