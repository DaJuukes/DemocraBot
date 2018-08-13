const Discord = require('discord.js')
const {User} = require('../db')

module.exports = {
  name: 'stats',
  type: 'core',
  usage: 'stats',
  permission: 1,
  help: 'Check bot stats.',
  main: async function (bot, message) {
    const emb = new Discord.RichEmbed()
      .setTitle('HempBot Stats')
      .setColor('GREEN')
      .setAuthor(bot.user.username)
      .setThumbnail(bot.user.displayAvatarURL)
      .addField('😀 Users', bot.users.size, true)
      .addField('⌨ Channels', bot.users.size, true)
      .addField('🏆 Guilds', bot.guilds.size, true)

    const amt = await User.aggregate([{
      $group: {
        _id: null,
        sum: { $sum: '$balance' }
      }
    }])

    emb.addField('Total THC Held', amt[0].sum)

    return message.channel.send(emb)
  }
}
