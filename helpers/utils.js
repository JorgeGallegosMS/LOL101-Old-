require('dotenv').config()
const fetch = require('node-fetch')

const key = 'RGAPI-1f3eff02-cf93-44e7-b820-8c5b33387413'

const capitalize = word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const getVersion = async () => {
    const version_list = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    const versions = await version_list.json()
    const version = versions[0]

    return version
}

/**
 * Calls the Riot API and returns an object of champion names sorted alphabetically
 * @param version
 * The current version of the API
 */
const getChampionsData = async version => {
    const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
    const data = await response.json()
    const champions = data.data
    const champsList = []
    const champs = {
        "version": version
    }

    for (champion in champions) {
        champsList.push([getCleanedName(champions[champion]['name']), champions[champion]['id']])
    }

    dataSetup(champsList, champs, champions)

    await getSingleChampionData(version, champs)

    return champs
}

const dataSetup = (champsList, champsDict, data) => {
    champsList.sort()
    champsList.forEach(champ => {
        let current_champ = champ[0]
        let champ_name = champ[1]
        champsDict[current_champ] = {'name': champ_name}
        champsDict[current_champ].title = capitalize(data[champ_name].title)
        champsDict[current_champ].id = parseInt(data[champ_name].key)
        champsDict[current_champ].difficulty = data[champion].info.difficulty
        champsDict[current_champ].icon = `http://ddragon.leagueoflegends.com/cdn/10.12.1/img/champion/${champ_name}.png`
        champsDict[current_champ].abilities = []
        champsDict[current_champ].skins = []
        champsDict[current_champ].tips = {}
        champsDict[current_champ].tips.playingAs = []
        champsDict[current_champ].tips.playingAgainst = []
    })
}
const getChampionRotations = async champsDict => {
    try {
        const champ_data = await fetch(`https://na1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${key}`)
        const data = await champ_data.json()
        const freeRotation = data['freeChampionIds']
        const freeRotationNewPlayers = data['freeChampionIdsForNewPlayers']
        let champion_rotation = []
        // console.log(freeRotationNewPlayers)
        // console.log(data)
        for (champion in champsDict) {
            const champ_name = champsDict[champion].name
            const champ_id = champsDict[champion].id
            if (freeRotation.includes(champ_id)) {
                const freeRotationChamp = {
                    'champ_id': champ_id,
                    'champ_name': champ_name,
                    'loading_art': `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ_name}_0.jpg`
                }
                champion_rotation.push(freeRotationChamp)
            }
        }
        // console.log(champion_rotation)
        return champion_rotation
    } catch (err) {
        console.log(err)
    }
}

const getSingleChampionData = async (version, champsDict) => {
    try {
        for (champion in champsDict) {
            if (champsDict[champion].hasOwnProperty('name')){
                const champ_name = champsDict[champion].name
                const champ_data = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champ_name}.json`)
                const data = await champ_data.json()
                const champ = data.data
                const current_champ = champ[`${champ_name}`]
                
                getSkins(current_champ, champsDict)
                getTips(current_champ, champsDict)
                getAbilities(current_champ, champsDict)
            }
        }
    } catch (err){
        console.error(err)
    }
}

const getSkins = (champion, champsDict) => {
    const name = getCleanedName(champion.name)
    champion.skins.forEach(skin => {
        const current_skin =  {
            'skin_name': skin.name,
            'splash_url': `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`,
            'loadingScreen_url': `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`
        }

        champsDict[name].skins.push(current_skin)
    })
}

const getTips = (champion, champsDict) => {
    const name = getCleanedName(champion.name)
    champion.allytips.forEach(tip =>{
        champsDict[name].tips.playingAs.push(tip)
    })

    champion.enemytips.forEach(tip =>{
        champsDict[name].tips.playingAgainst.push(tip)
    })
}

const getAbilities = (champion, champsDict) => {
    const name = getCleanedName(champion.name)
    champion.spells.forEach(spell => {
        const spell_id = spell.id
        const spell_name = spell.name
        const description = spell.description
        const cooldown = spell.cooldown

        const data = {
            'id': spell_id,
            'name': spell_name,
            'description': description,
            'cooldown': cooldown
        }

        champsDict[name].abilities.push(data)
    })
}

const getCleanedName = name => {
    return capitalize(name.replace(/[^a-z0-9]/gi, '').toLowerCase())
}

const getChampionByName = (name, champsDict) => {
    let champ
    name.replace(/[^a-z0-9]/gi, '').toLowerCase()
    for (champion in champsDict){
        if (champsDict[champion].hasOwnProperty('name')){
            current_champ = champsDict[champion]
            if (champion.toLowerCase() == name.toLowerCase()){
                champ = current_champ
                res.send(champ)
            }
        }
    }
}

module.exports = {
    capitalize,
    getVersion,
    getChampionsData,
    getChampionRotations
}