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
    const {author, guild, member} = msg

    if (bot.config.owner.indexOf(msg.author.id) > -1) {
      return 6
    }
    if (msg.channel.type == 'dm' || !member) return 1

    if (author && guild && guild.owner && author.id === guild.owner.id) {
      return 5
    } else if (member.hasPermission('MANAGE_GUILD')) {
      return 4
    } else if (member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) {
      return 3
    } else if (member.hasPermission('MANAGE_MESSAGES')) {
      return 2
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
