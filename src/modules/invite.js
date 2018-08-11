const Discord = require('discord.js')

module.exports = {
  name: 'invite',
  type: 'core',
  usage: 'invite',
  example: 'invite',
  permission: 1,
  help: 'Generate support server/bot invite links',
  main: async function (bot, message) {
    let emb = new Discord.RichEmbed()
      .setTitle(`Bot Resources`)
      .setThumbnail(bot.user.displayAvatarURL)
      .setColor(`GOLD`)
      .addField(`Bot Invite`, `[Here](${process.env.INVITE_LINK})`, true)
      .addField(`Support Server`, `[Here](${process.env.SUPPORT_SERVER})`, true)

    message.channel.send(emb)
  }
}
