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
 * Calls the Riot API and returns a list of champion names sorted alphabetically
 */
const getChampionsList = async version => {
    const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
    const data = await response.json()
    const champions = data.data
    const champsList = []

    for (champion in champions) {
        champsList.push([champions[champion]['name'], champions[champion]['id']])
    }

    return champsList
}

module.exports = {
    capitalize,
    getVersion,
    getChampionsList
}