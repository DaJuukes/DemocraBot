const Discord = require('discord.js')

module.exports = bot => {
  bot.enabled = function (command, guild) {
    if (command || guild) {
      return true
    } else {
      return false
    }
  }

  bot.showUsage = async function (command, msg) {
    let prefix = await bot.getPrefix(msg)
    if (command.name === '$') prefix = ''

    let emb = new Discord.RichEmbed()

    emb.addField(prefix + command.usage, command.help)
    emb.addField('Usage', prefix + command.example)

    emb.setColor(`GOLD`)

    msg.channel.send(emb)
  }

  bot.permLevel = function (msg) {
    const {author} = msg

    if (process.env.OWNER && author && process.env.OWNER === author.id) {
      return 6
    } else {
      return 1
    }
  }

  bot.addCommas = function (x) {
    if (!x) {
      return 'N/A'
    } else {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
