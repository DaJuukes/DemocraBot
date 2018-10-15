module.exports = async function (msg, bot, channel) {
  if (channel && msg.channel.id === channel) bot.log(msg.guild.name + ' | ' + msg.channel.name + ' | ' + msg.member.displayName + ' | ' + msg.cleanContent)

  if (msg.author.bot) return

  if (msg.isMentioned(bot.user)) {
    if (msg.content.toLowerCase().includes("what's your prefix") || msg.content.toLowerCase().includes('whats your prefix') || msg.content.toLowerCase().includes('help')) {
      bot.getPrefix(msg).then(prefix => {
        msg.reply('my prefix for this server is `' + prefix + '`!\n\nRun `' + prefix + 'help` to get commands!')
      })
    }

    if (msg.content.toLowerCase().includes('resetprefix') && msg.member.hasPermission('ADMINISTRATOR')) {
      bot.setPrefix(bot.config.prefix, msg.guild)
      msg.reply('I have reset this server\'s prefix to ``' + bot.config.prefix + '``')
    }
  } else if (msg.content.toLowerCase().indexOf('despair') > -1 || msg.content.toLowerCase().indexOf('d e s p a i r') > -1) {
    let cmd = bot.commands.get('despair')
    cmd.main(bot, msg).catch(err => {
      bot.error(err)
      msg.channel.send(':x: We encountered an error!')
    })
  } else {
    bot.getPrefix(msg).then(prefix => {
      if (msg.content.startsWith(prefix) || prefix === '') {
        try {
          msg.args = msg.content.split(/\s+/g)
          msg.content = msg.content.substring(msg.content.indexOf(' ') + 1, msg.content.length) || null
          let command = msg.args.shift().slice(prefix.length).toLowerCase()
          if (msg.channel.type === 'dm') {
            msg.channel.send(`Commands are not available in DM.`)
            return
          }
          let cmd = bot.commands.get(command)
          let perms = bot.permLevel(msg)

          if (!cmd) {
            return
          } else if (perms === 0) {
            msg.reply('you are blacklisted from using the bot!')
          } else if (perms < cmd.permission) {
            msg.reply('you do not have permission to do this!')
          } else if (bot.enabled(cmd)) {
            bot.logCommand(command, msg.content, msg.author.username, msg.channel.name, msg.guild.name)
            cmd.main(bot, msg).catch(err => {
              bot.error(err)
              msg.channel.send(':x: We encountered an error!')
            })
          }
        } catch (err) {
          msg.channel.send(':x: We encountered an error!')
          bot.error(err)
        }
      }
    })
  }
}
