const utils = require('../helpers/utils')
const fs = require('fs')

const setAPIVersion = async (req, res, next) => {
    const version = await utils.getVersion()
    res.version = version
    next()
}

const setChampionsData = async (req, res, next) => {
    let champs = JSON.parse(fs.readFileSync('champions.json'))

        // Rewrites champions.json file if the Riot API version changes
        if (res.version != champs.version){
            const data = await utils.getChampionsData(res.version)
            fs.writeFileSync('./champions.json', JSON.stringify(data, null, 4))
            champs = JSON.parse(fs.readFileSync('champions.json'))
        }

    res.champs = champs
    next()
}

module.exports = {
    setAPIVersion,
    setChampionsData
}