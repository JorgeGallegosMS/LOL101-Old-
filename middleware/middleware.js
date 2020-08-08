const utils = require('../helpers/utils')
const fs = require('fs')
const fsPromises = fs.promises

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
    // Testing fs.promises
    try {
        let champs
        if (!fs.existsSync('champions.json')){
            const data = await utils.getChampionsData(res.version)
            // fs.writeFileSync('champions.json', JSON.stringify(data, null, 2))
            // champs = JSON.parse(fs.readFileSync('champions.json'))
            await fsPromises.writeFile('champions.json', JSON.stringify(data, null, 2))
            champs = JSON.parse(await fsPromises.readFile('champions.json', 'utf-8'))
            
        } else {
            champs = JSON.parse(await fsPromises.readFile('champions.json', 'utf-8'))
            if (res.version != champs.version){
                const data = await utils.getChampionsData(res.version)
                // fs.writeFileSync('champions.json', JSON.stringify(data, null, 2))
                // champs = JSON.parse(fs.readFileSync('champions.json'))
                await fsPromises.writeFile('champions.json', JSON.stringify(data, null, 2))
                champs = JSON.parse(await fsPromises.readFile('champions.json', 'utf-8'))
            }
        }
    
        res.champs = champs
        next()
    } catch (err) {
        console.error(err)
    }
}

const setItemsData = async (req, res, next) => {
    try {
        if (!fs.existsSync('items.json')){
            const data = await utils.getItemsData(res.version)
            fs.writeFileSync('items.json', JSON.stringify(data, null, 4))
            items = JSON.parse(fs.readFileSync('items.json', {encoding: 'utf-8'}))
        } else {
            items = JSON.parse(fs.readFileSync('items.json'))
            if (res.version != items.version){
                const data = await utils.getItemsData(res.version)
                fs.writeFileSync('items.json', JSON.stringify(data, null, 4))
                items = JSON.parse(fs.readFileSync('items.json', {encoding: 'utf-8'}))
            }
        }
    
        res.items = items
        next()
    } catch (err) {
        console.error(err)
    }
}
const setSpellsData = async (req, res, next) => {
    try {
        if (!fs.existsSync('spells.json')){
            const data = await utils.getSummonerSpellData(res.version)
            fs.writeFileSync('spells.json', JSON.stringify(data, null, 4))
            spells = JSON.parse(fs.readFileSync('spells.json', {encoding: 'utf-8'}))
        } else {
            spells = JSON.parse(fs.readFileSync('spells.json'))
            if (res.version != spells.version){
                const data = await utils.getSummonerSpellData(res.version)
                fs.writeFileSync('spells.json', JSON.stringify(data, null, 4))
                spells = JSON.parse(fs.readFileSync('spells.json', {encoding: 'utf-8'}))
            }
        }
    
        res.spells = spells
        next()
    } catch (err) {
        console.error(err)
    }
}

const setRunesData = async (req, res, next) => {
    try {
        if (!fs.existsSync('runes.json')){
            const data = await utils.getRunesData(res.version)
            fs.writeFileSync('runes.json', JSON.stringify(data, null, 4))
            runes = JSON.parse(fs.readFileSync('runes.json', {encoding: 'utf-8'}))
        } else {
            runes = JSON.parse(fs.readFileSync('runes.json'))
            if (res.version != runes.version){
                const data = await utils.getRunesData(res.version)
                fs.writeFileSync('runes.json', JSON.stringify(data, null, 4))
                runes = JSON.parse(fs.readFileSync('runes.json', {encoding: 'utf-8'}))
            }
        }
    
        res.runes = runes
        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    setAPIVersion,
    setChampionsData,
    setItemsData,
    setSpellsData,
    setRunesData,
}