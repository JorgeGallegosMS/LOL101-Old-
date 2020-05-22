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

module.exports = {
    capitalize,
    getVersion
}