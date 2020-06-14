const utils = require('./utils')

const getAPIVersion = async (req, res, next) => {
    const version = await utils.getVersion()
    res.version = version
    next()
}

module.exports = {
    getAPIVersion
}