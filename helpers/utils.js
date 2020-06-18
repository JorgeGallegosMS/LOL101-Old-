const fetch = require('node-fetch')

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
 */
const getChampionsData = async version => {
    const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
    const data = await response.json()
    const champions = data.data
    const champsList = []
    const champs = {}

    for (champion in champions) {
        champsList.push([champions[champion]['name'], champions[champion]['id']])
    }

    champsList.sort()
    champsList.forEach(champ => {
        let current_champ = champ[0]
        let champ_name = champ[1]
        champs[current_champ] = {'name': champ_name}
        champs[current_champ].title = capitalize(champions[champ_name].title)
        champs[current_champ].id = parseInt(champions[champ_name].key)
        champs[current_champ].difficulty = champions[champion].info.difficulty
        champs[current_champ].skins = []
        champs[current_champ].tips = {}
        champs[current_champ].tips.playingAs = []
        champs[current_champ].tips.playingAgainst = []
    })

    await getSingleChampionData(version, champs)

    return champs
}

const getSingleChampionData = async (version, champsDict) => {
    try {
        for (champion in champsDict) {
            const champ_name = champsDict[champion].name
            const champ_data = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champ_name}.json`)
            const data = await champ_data.json()
            const champ = data.data
            const current_champ = champ[`${champ_name}`]
            
            getSkins(current_champ, champsDict)
            getTips(current_champ, champsDict)
            getAbilities(current_champ, champsDict)
        }
    } catch (err){
        console.error(err)
    }
}

const getSkins = (champion, champsDict) => {
    champion.skins.forEach(skin => {
        const current_skin =  {
            'skin_name': skin.name,
            'skin_url': `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${skin.num}.jpg`
        }
        champsDict[champion.name].skins.push(current_skin)
    })
}

const getTips = (champion, champsDict) => {
    champion.allytips.forEach(tip =>{
        champsDict[champion.name].tips.playingAs.push(tip)
    })

    champion.enemytips.forEach(tip =>{
        champsDict[champion.name].tips.playingAgainst.push(tip)
    })
}

const getAbilities = (champion, champsDict) => {

}

module.exports = {
    capitalize,
    getVersion,
    getChampionsData
}