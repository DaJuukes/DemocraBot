const {Server} = require('../../db')

module.exports = bot => {
  bot.syncServers = async function () {
    return new Promise((resolve, reject) => {
      bot.guilds.forEach(guild => {
        Server.findOne({id: guild.id}).then(server => {
          if (!server) {
            Server.create({ id: guild.id, prefix: process.env.DEFAULT_PREFIX })
          }
        })
      })
      bot.log('Servers synced.')
      resolve(true)
    })
  }

  bot.removeServer = async function (guild) {
    await Server.remove({id: guild.id})
    bot.log(guild.name + ' successfully removed from the database!')
  }

  bot.addServer = async function (guild) {
    await Server.create({id: guild.id, prefix: process.env.DEFAULT_PREFIX})
    bot.log(guild.name + ' successfully inserted into the database!')
  }

  bot.getPrefix = async function (msg) {
    const {prefix} = await Server.findOne({id: msg.guild.id})
    if (!prefix) bot.error('prefix not found for guild ' + msg.guild.name)
    return prefix
  }

  bot.setPrefix = async function (prefix, guild) {
    return Server.findOneAndUpdate({id: guild.id}, {prefix})
  }
}
