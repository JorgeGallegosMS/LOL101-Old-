require('dotenv').config()
const fetch = require('node-fetch')

const key = 'RGAPI-61e32dfb-82d7-4b1f-8a00-203addf728c3'


const capitalize = word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const getAccountInfo = async query => {
    let region = 'na'
    // let query = 'AlaskaTryndamere'
    const resOne = await fetch(`https://${region}1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${query}?api_key=${key}`)
    const resOneData = await resOne.json()
    // console.log(resOne)
    const summonerID = resOneData.id
    console.log(summonerID)
    // console.log(resOneData)
    const resTwo = await fetch(`https://${region}1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}?api_key=${key}`)
    const resTwoData = await resTwo.json()
    // console.log(resTwoData)
    try {
        if (resTwoData[0].queueType == 'RANKED_SOLO_5x5') {

            const summonerInfo = {
                'lvl': resOneData.summonerLevel,
                'profileIconID': resOneData.profileIconId,
                'summonerName': resOneData.name,
                'soloDuo': { 
                    'rank': resTwoData[0].tier,
                    'tier': resTwoData[0].rank,
                    'lp': resTwoData[0].leaguePoints,
                    'wins': resTwoData[0].wins,
                    'losses': resTwoData[0].losses,
                    'winrate': (resTwoData[0].wins / (resTwoData[0].wins + resTwoData[0].losses))
                }
            }
            console.log(summonerInfo)
            return summonerInfo
        } else if (resTwoData[1].queueType == 'RANKED_SOLO_5x5') {
    
            const summonerInfo = {
                'lvl': resOneData.summonerLevel,
                'profileIconID': resOneData.profileIconId,
                'summonerName': resOneData.name,
                'soloDuo': { 
                    'rank': resTwoData[1].tier,
                    'tier': resTwoData[1].rank,
                    'lp': resTwoData[1].leaguePoints,
                    'wins': resTwoData[1].wins,
                    'losses': resTwoData[1].losses,
                    'winrate': (resTwoData[1].wins / (resTwoData[1].wins + resTwoData[1].losses))
                }
            }
            console.log(summonerInfo)
            return summonerInfo
        }
        
    } catch (error) {
        const summonerInfo = {
            'lvl': resOneData.summonerLevel,
            'profileIconID': resOneData.profileIconId,
            'summonerName': resOneData.name
        }
        console.log(summonerInfo)
        return summonerInfo
    }
}

const getVersion = async () => {
    try {
        const version_list = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
        const versions = await version_list.json()
        const version = versions[0]
    
        return version
    } catch (err) {
        console.error(err)
    }
}
/**
 * Calls the Riot API and returns an object of champion names sorted alphabetically
 * @param version
 * The current version of the API
 */
const getChampionsData = async version => {
    try {
        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
        const data = await response.json()
        const champions = data.data
        const champsList = []
        const champs = {
            "version": version
        }
    
        for (champion in champions) {
            champsList.push([champions[champion]['name'], champions[champion]['id']])
        }
    
        dataSetup(champsList, champs, champions)
    
        await getSingleChampionData(version, champs)
    
        return champs
    } catch (err) {
        console.error(err)
    }
}

const dataSetup = (champsList, champsDict, data) => {
    champsList.sort()
    champsList.forEach(champ => {
        let current_champ = getCleanedName(champ[0])
        let champ_name = champ[1]
        champsDict[current_champ] = {'name': champ[0]}
        champsDict[current_champ].nickname = champ_name
        champsDict[current_champ].title = capitalize(data[champ_name].title)
        champsDict[current_champ].id = parseInt(data[champ_name].key)
        champsDict[current_champ].difficulty = data[champion].info.difficulty
        champsDict[current_champ].icon = `http://ddragon.leagueoflegends.com/cdn/10.12.1/img/champion/${champ_name}.png`
        champsDict[current_champ].lore = ''
        champsDict[current_champ].tags = data[champ_name].tags
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

                // let query = 'AnchorageAlaska'
                // getAccountInfo(query)

                // getRecommendedItems(current_champ, champsDict)
                getLore(current_champ, champsDict)
                getSkins(current_champ, champsDict)
                getTips(current_champ, champsDict)
                getAbilities(version, current_champ, champsDict)
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

const getLore = (champion, champsDict) => {
    const name = getCleanedName(champion.name)
    champsDict[name].lore = champion.lore
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

const getAbilities = (version, champion, champsDict) => {
    const name = getCleanedName(champion.name)
    champion.spells.forEach(spell => {
        const spell_id = spell.id
        const spell_name = spell.name
        const description = spell.description
        const cooldown = spell.cooldown
        const cooldownString = spell.cooldownBurn
        const damage = spell.effect[1][0] == 0 ? "?" : spell.effect[1]
        const damageString = damage == "?" ? "?" : spell.effectBurn[1]
        const costType = spell.costType == 'No Cost' ? spell.costType : champion.partype
        const icon = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell_id}.png`

        const data = {
            'id': spell_id,
            'name': spell_name,
            'costType': costType,
            'icon': icon,
            'description': description,
            'cooldownString': cooldownString,
            'cooldown': cooldown,
            'damageString': damageString,
            'damage': damage
        }
        // console.log(cleanTooltip(spell.tooltip))
        champsDict[name].abilities.push(data)
    })
}

    
    
    
    // try {
    //     if ((resTwoData[1].queueType == 'RANKED_SOLO_5x5') && (resTwoData[0].queueType == 'RANKED_FLEX_SR')) {
    //         console.log('Placed in both')
    //     }
    // } catch (err) {
    //     console.log(err)
    // }

    // if (resTwoData[0].queueType == 'RANKED_SOLO_5x5') {
    //     const summonerInfo = {
    //         'lvl': resOneData.summonerLevel,
    //         'profileIconID': resOneData.profileIconId,
    //         'summonerName': resOneData.name,
    //         'solo/duo': { 
    //             'rank': resTwoData[0].tier,
    //             'tier': resTwoData[0].rank,
    //             'lp': resTwoData[0].leaguePoints,
    //             'wins': resTwoData[0].wins,
    //             'losses': resTwoData[0].losses,
    //             'winrate': (resTwoData[0].wins / (resTwoData[0].wins + resTwoData[0].losses))
    //         }
    //     }
    //     console.log(summonerInfo)



    // } else if (resTwoData[1].queueType == 'RANKED_SOLO_5x5') {
    //     const summonerInfo = {
    //         'lvl': resOneData.summonerLevel,
    //         'profileIconID': resOneData.profileIconId,
    //         'summonerName': resOneData.name,
    //         'solo/duo': { 
    //             'rank': resTwoData[1].tier,
    //             'tier': resTwoData[1].rank,
    //             'lp': resTwoData[1].leaguePoints,
    //             'wins': resTwoData[1].wins,
    //             'losses': resTwoData[1].losses,
    //             'winrate': (resTwoData[1].wins / (resTwoData[1].wins + resTwoData[1].losses))
    //         },
    //         'flex': {
    //             'rank': resTwoData[0].tier,
    //             'tier': resTwoData[0].rank,
    //             'lp': resTwoData[0].leaguePoints,
    //             'wins': resTwoData[0].wins,
    //             'losses': resTwoData[0].losses,
    //             'winrate': (resTwoData[0].wins / (resTwoData[0].wins + resTwoData[0].losses))
    //         }
    //     }
    //     console.log(summonerInfo)

    // } else if (resTwoData[0].queueType == 'RANKED_FLEX_SR') {
    //     const summonerInfo = {
    //         'lvl': resOneData.summonerLevel,
    //         'profileIconID': resOneData.profileIconId,
    //         'summonerName': resOneData.name,
    //         'flex': {
    //             'rank': resTwoData[0].tier,
    //             'tier': resTwoData[0].rank,
    //             'lp': resTwoData[0].leaguePoints,
    //             'wins': resTwoData[0].wins,
    //             'losses': resTwoData[0].losses,
    //             'winrate': (resTwoData[0].wins / (resTwoData[0].wins + resTwoData[0].losses))
    //         }
    //     }
    //     console.log(summonerInfo)
    // } else {
    //     const summonerInfo = {
    //         'lvl': resOneData.summonerLevel,
    //         'profileIconID': resOneData.profileIconId,
    //         'summonerName': resOneData.name
    //     }
    //     console.log(summonerInfo)
    // }
    
    /* 
    [ { leagueId: 'beac6303-09ea-40f0-9f82-ac0590427de9',
    queueType: 'RANKED_FLEX_SR',
    tier: 'PLATINUM',
    rank: 'IV',
    summonerId: '0OnX9EQsRu4MeQSClTSjokSK0rXdAoPxL5-KqI-LYqRIk48',
    summonerName: 'AlaskaTryndamere',
    leaguePoints: 6,
    wins: 28,
    losses: 26,
    veteran: false,
    inactive: false,
    freshBlood: false,
    hotStreak: false },
  { leagueId: '7a29f64c-a114-4a5a-969c-98cbb74e9e40',
    queueType: 'RANKED_SOLO_5x5',
    tier: 'PLATINUM',
    rank: 'IV',
    summonerId: '0OnX9EQsRu4MeQSClTSjokSK0rXdAoPxL5-KqI-LYqRIk48',
    summonerName: 'AlaskaTryndamere',
    leaguePoints: 67,
    wins: 66,
    losses: 49,
    veteran: false,
    inactive: false,
    freshBlood: false,
    hotStreak: false } ]*/
    /*
    
            if responseJSON_2[0]["queueType"] == "RANKED_SOLO_5x5":
                infoNum = 0
            elif responseJSON_2[1]["queueType"] == "RANKED_SOLO_5x5":
                infoNum = 1
            else:
                infoNum = 2
            
            tier = responseJSON_2[infoNum]["tier"].lower().capitalize()
            rank = responseJSON_2[infoNum]["rank"]
            wins = str(responseJSON_2[infoNum]["wins"])
            losses = str(responseJSON_2[infoNum]["losses"])

            winrate_dec = responseJSON_2[infoNum]["wins"]/(responseJSON_2[infoNum]["wins"] + responseJSON_2[infoNum]["losses"])
            winrate = str(round(winrate_dec * 100, 2))

        */


const getCleanedName = name => {
    return capitalize(name.replace(/[^a-z0-9]/gi, '').toLowerCase())
}

// const cleanTooltip = tooltip => {
//     cleaned = tooltip.replace(/[{}]/g, '')
//     return cleaned.slice(0,20)
// }

const getRecommendedItems = async (champion, champsDict) => {
    // getItemInfo(champion)
    //Loop through all recommended sets, and check if mode is CLASSIC

    const name = getCleanedName(champion.name)
    test = champion.recommended
    const item_block = {}        

    for (n = 0; n < test.length; n++) {
        if (test[n].mode == "CLASSIC") {
            for (i = 0; i < test[n].blocks.length; i++) {
                item_block[test[n].blocks[i].type] = {
                    'items': test[n].blocks[i].items,
                }
                let list = item_block[test[n].blocks[i].type].items
                // console.log(list)
                for (j= 0; j < list.length; j++) {
                    const id = list[j].id
                    list[j]["info"] = await getItemInfo(id)
                    // console.log(list.length)

                }
                // console.log(list)

            }
            console.log(item_block)

            // console.log(test.blocks.length)

                }
            }
}

const getItemInfo = async itemId => {
    const champ_data = await fetch('http://ddragon.leagueoflegends.com/cdn/10.13.1/data/en_US/item.json')
    const data = await champ_data.json()
    const list_of_items = data.data
    return list_of_items[itemId]
}

module.exports = {
    capitalize,
    getVersion,
    getChampionsData,
    getChampionRotations,
    getAccountInfo
}