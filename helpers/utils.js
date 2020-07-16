require('dotenv').config()
const fetch = require('node-fetch')

const key = process.env.RIOT_API_KEY


const capitalize = word => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const getAccountInfo = async query => {
    let region = 'na'
    // let query = 'AlaskaTryndamere'
    const resOne = await fetch(`https://${region}1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${query}?api_key=${key}`)
    const resOneData = await resOne.json()
    const summonerID = resOneData.id
    const resTwo = await fetch(`https://${region}1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerID}?api_key=${key}`)
    const resTwoData = await resTwo.json()
    try {
        if (resTwoData[0].queueType == 'RANKED_SOLO_5x5') {

            const summonerInfo = {
                'lvl': resOneData.summonerLevel,
                'icon': `http://ddragon.leagueoflegends.com/cdn/10.14.1/img/profileicon/${resOneData.profileIconId}.png`,
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
            return summonerInfo
        } else if (resTwoData[1].queueType == 'RANKED_SOLO_5x5') {
    
            const summonerInfo = {
                'lvl': resOneData.summonerLevel,
                'icon': `http://ddragon.leagueoflegends.com/cdn/10.14.1/img/profileicon/${resOneData.profileIconId}.png`,
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
            return summonerInfo
        }
        
    } catch (error) {
        const summonerInfo = {
            'lvl': resOneData.summonerLevel,
            'icon': `http://ddragon.leagueoflegends.com/cdn/10.14.1/img/profileicon/${resOneData.profileIconId}.png`,
            'summonerName': resOneData.name
        }
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
        const itemsDict = getItemsData(version)
        const spellsDict = getSummonerSpellData(version)
        const champs = {
            "version": version
        }
    
        for (champion in champions) {
            champsList.push([champions[champion]['name'], champions[champion]['id']])
        }
    
        dataSetup(version, champsList, champs, champions)
    
        await getSingleChampionData(version, champs, itemsDict)
    
        return champs
    } catch (err) {
        console.error(err)
    }
}

const dataSetup = (version, champsList, champsDict, data) => {
    champsList.sort()
    champsList.forEach(champ => {
        let current_champ = getCleanedName(champ[0])
        let champ_name = champ[1]
        champsDict[current_champ] = {'name': champ[0]}
        champsDict[current_champ].nickname = champ_name
        champsDict[current_champ].title = capitalize(data[champ_name].title)
        champsDict[current_champ].id = parseInt(data[champ_name].key)
        champsDict[current_champ].difficulty = data[champ_name].info.difficulty
        champsDict[current_champ].icon = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ_name}.png`
        champsDict[current_champ].lore = ''
        champsDict[current_champ].tags = data[champ_name].tags
        champsDict[current_champ].abilities = []
        champsDict[current_champ].recommended = []
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
        for (champion in champsDict) {
            const champ_name = champsDict[champion].nickname
            const champ_id = champsDict[champion].id
            if (freeRotation.includes(champ_id)) {
                const freeRotationChamp = {
                    'champ_id': champ_id,
                    'champ_name': champ_name,
                    'splash_art': `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ_name}_0.jpg`,
                    'loading_art': `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ_name}_0.jpg`
                }
                champion_rotation.push(freeRotationChamp)
            }
        }
        return champion_rotation
    } catch (err) {
        console.error(err)
    }
}

const getSingleChampionData = async (version, champsDict, itemsDict) => {
    try {
        const itemDict = await getItemsData(version)
        for (champion in champsDict) {
            if (champsDict[champion].hasOwnProperty('name')){
                const champ_name = champsDict[champion].nickname
                const champ_data = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champ_name}.json`)
                const data = await champ_data.json()
                const champ = data.data
                const current_champ = champ[`${champ_name}`]
                // let query = 'AnchorageAlaska'
                // getAccountInfo(query)
                // stripItemDescription("beh")
                getRecommendedItems(current_champ, champsDict, itemDict)
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
            'loadingScreen_url': `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_${skin.num}.jpg`,
            'icon': `http://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${champion.id}_${skin.num}.jpg`
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
    const key4Icon = champion.passive.image.full
    const passive = {
        "name": champion.passive.name,
        "description": champion.passive.description,
        "icon": `http://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${key4Icon}`
    }
    champsDict[name].abilities.push(passive)
    champion.spells.forEach(spell => {
        const spell_id = spell.id
        const spell_name = spell.name
        const description = spell.description
        const tooltip = cleanSpellTooltip(spell, spell.tooltip.split(" "))
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
            'tooltip': tooltip,
            'cooldownString': cooldownString,
            'cooldown': cooldown,
            'damageString': damageString,
            'damage': damage
        }
        champsDict[name].abilities.push(data)
    })
}

const getCleanedName = name => {
    return capitalize(name.replace(/[^a-z0-9]/gi, '').toLowerCase())
}

const cleanSpellTooltip = (spell, tooltip) => {
    const markers = getMarkers(tooltip)
    
    const values = getMarkerValues(spell, markers)
    
    fillMarkerValues(tooltip, markers, values)
    
    const cleanedTooltip = cleanToolTip(tooltip)

    return cleanedTooltip;
}

const cleanToolTip = tooltip => {
    for (let i = 0; i < tooltip.length; i++){
        let current = tooltip[i]
        if (current.includes('<') || current.includes('>')){
            while (current.includes('<') || current.includes('>')){
                let openingIndex = current.indexOf('<')
                let closingIndex = current.indexOf('>')
                
                const chars = current.split("")
                
                if (closingIndex > -1 && openingIndex > -1){
                    if(openingIndex > closingIndex){
                        chars.splice(0, closingIndex + 1)
                        current = chars.join("")
                    } else {
                        chars.splice(openingIndex, closingIndex - openingIndex + 1)
                        current = chars.join("")
                    }
                } else if (openingIndex > -1){
                    chars.splice(openingIndex, current.length - openingIndex + 1)
                    current = chars.join("")
                } else if (closingIndex > -1) {
                    chars.splice(0, closingIndex + 1)
                    current = chars.join("")
                } else {
                    break
                }
            }
        } else if (current.includes('(')){
            tooltip[i] = current.replace(/[^(+]/g, '')
        } else if (current.includes(')')){
            tooltip[i] = current.replace(/[^)]/g, '')
        } else if (current.includes('class')){
            index = tooltip.indexOf(current)
            if (index > -1){
                tooltip.splice(index, 1)
            }
        }
        tooltip[i] = current
    }
    return tooltip.join(" ").replace(/[{}]/g, '').replace(/\s\s+/g, ' ').replace(/[_]/g, '').replace(/\s%/g, '').replace(/\s[s]\s/g, 's ')
}

const getMarkers = tooltip => {
    let markers = []
    for (let i = 0; i < tooltip.length; i++){
        if (isNaN(Number(tooltip[i][0])) && !isNaN(Number(tooltip[i][1]))){
            let marker = tooltip[i]
            if (marker.length != 2){
                marker = marker.substring(0,2)
                tooltip[i] = marker
            }

            markers.push(marker)
        } else {
            if (i > 0){
                let marker = tooltip[i]
                const previous = tooltip[i-1]
                if (previous.includes('{')){
                    markers.push(marker)
                }
            }
        }
    }

    return markers
}

const getMarkerValues = (spell, markers) => {
    const values = []
    for (let i = 0; i < markers.length; i++){
        const currentMarker = markers[i]
        if (currentMarker.length == 2){
            const character = currentMarker[0]
            const index = parseInt(currentMarker[1])
            
            switch(character) {
                case 'e':
                    values.push(String(spell.effectBurn[index]))
                    break
                case 'a':
                case 'f':
                    if (spell.vars.length > 0){
                        let found = false
                        let value
                        spell.vars.forEach(item => {
                            if (item.key == currentMarker){
                                found = true
                                value = item.coeff
                            }
                        })
                        if (found){
                            values.push(String(value))
                            found = false
                        } else {
                            values.push('?')
                        }
                    } else {
                        values.push('?')
                    }
                    break
                default:
                    break
            }
        } else {
            values.push('?')
        }
    }

    return values
}

const fillMarkerValues = (tooltip, markers, values) => {
    if (values.length > 0){
        for (let i = 0; i < values.length; i++){
            const marker = markers[i]
            const index = tooltip.indexOf(marker)
            if (index > -1){
                tooltip[index] = String(values[i])
            }
        }
    }
}

const getRecommendedItems = async (champion, champsDict, itemDict) => {
    // getItemInfo(champion)
    //Loop through all recommended sets, and check if mode is CLASSIC

    const name = getCleanedName(champion.name)
    test = champion.recommended
    const item_block = {}        
    const recommended = []

    for (n = 0; n < test.length; n++) {
        if (test[n].mode == "CLASSIC") {
            for (i = 0; i < test[n].blocks.length; i++) {
                if (test[n].blocks.length > 6) {
                    item_block[test[n].blocks[i].type] = {
                        'items': test[n].blocks[i].items,
                        'type': test[n].blocks[i].type,
                        'jg_exists': true
                    }
                } else {
                    item_block[test[n].blocks[i].type] = {
                        'items': test[n].blocks[i].items,
                        'type': test[n].blocks[i].type,
                        'jg_exists': undefined
                    }
                }

                let list = item_block[test[n].blocks[i].type].items
                for (j= 0; j < list.length; j++) {
                    const id = list[j].id
                    // itemDict[id].description = cleanTooltip()
                    list[j]["info"] = itemDict[id]

                }

            }
            // recommended.push(item_block)
            champsDict[name].recommended.push(item_block)

                }
            }
    return recommended
}

const getItemsData = async version => {
    try {
        const response = await fetch(`http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`)
        const data = await response.json()
        const items = data.data

        const itemsDict = {
            'version': version
        }

        for (item in items){
            const current = items[item]
            const singleItem = {
                'name': current.name,
                'id': `${item}`,
                'description': stripItemDescription(current.description),
                'text': current.plaintext,
                'totalGold': current.gold.total,
                'icon': `http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item}.png`
            }

            itemsDict[item] = singleItem
        }

        return itemsDict
    } catch (err) {
        console.error(err)
    }
}
const getSummonerSpellData = async version => {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`)
        const data = await response.json()
        const spells = data.data

        const spellsDict = {
            'version': version
        }

        for (spell in spells){
            const current = spells[spell]
            const singleSpell = {
                'name': current.name,
                'id': `${spell}`,
                'description': current.description,
                'tooltip': current.tooltip,
                'cooldown': current.cooldown,
                'unlock-level': current.summonerLevel,
                'icon': `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${current.image.full}`
            }

            spellsDict[spell] = singleSpell
        }

        return spellsDict
    } catch (err) {
        console.error(err)
    }
}
const getRunesData = async version => {
    try {
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`)
        const data = await response.json()
        const runes = data
        const runesDict = {
            'version': version
        }
        const single_key_stone_rune = []
        const rune_key_stone = []
        for (rune in runes){
            const current = runes[rune]
            for (rune_set_index in runes[rune].slots) {
                let rune_tree = []
                for (single_rune_index in runes[rune].slots[rune_set_index].runes){
                    const single_rune_object = runes[rune].slots[rune_set_index].runes[single_rune_index]
                    const single_rune = {
                        "name": single_rune_object.name,
                        'icon': `https://ddragon.leagueoflegends.com/cdn/img/${single_rune_object.icon}`,
                        "id": single_rune_object.id,
                        "shortDes": single_rune_object.shortDesc,
                        "longDes": single_rune_object.longDesc
                    }
                    rune_tree.push(single_rune)
                }
                const rune_list = {
                    'runes': rune_tree
                }
                single_key_stone_rune.push(rune_list)
                const object2 = {
                    'name': current.name,
                    'icon': `https://ddragon.leagueoflegends.com/cdn/img/${current.icon}`,
                    'id': current.id,
                    'rune_row': single_key_stone_rune
                }
                rune_key_stone.push(object2)
            }
            runesDict[rune] = rune_key_stone
        }

        return runesDict
    } catch (err) {
        console.error(err)
    }
}

const stripItemDescription = description => {
    let res = description.replace(/<br\s*\/?>/mg,"\n")
    let result = res.replace(/<\/?[a-z]+>/g, "")
    return result
}

module.exports = {
    capitalize,
    getVersion,
    getChampionsData,
    getChampionRotations,
    getAccountInfo,
    getItemsData,
    getSummonerSpellData,
    getRunesData,
}