module.exports = bot => {
  bot.startGameCycle = async function () {
    bot.user.setPresence({
      game: {
        name: `Ready for duty!`,
        type: 3
      }
    })
  }

  bot.webhook = function (header, text, color) {
    var request = require('request')
    try {
      var d = {
        attachments: [{
          color: color,
          fields: [{
            title: header,
            value: text
          }],
          ts: new Date() / 1000
        }]
      }
      if (process.env.WEBHOOK) {
        request({
          url: process.env.WEBHOOK + '/slack',
          method: 'POST',
          body: d,
          json: true
        })
      }
    } catch (err) {
      bot.error(err)
    }
  }

  bot.joinleavehook = function (type, guild) {
    var request = require('request')
    bot.fetchGuildSize().then(guilds => {
      try {
        if (type === 'join') {
          var color = '#FFB200'
          var title = ':inbox_tray: New Guild! | Now in ' + guilds + ' guilds.'
        } else if (type === 'leave') {
          color = '#FF0000'
          title = ':outbox_tray: Left Guild | Now in ' + guilds + ' guilds.'
        }

        var members = 0

        var bots = 0
        guild.members.forEach(member => {
          if (member.user.bot) {
            bots++
          } else {
            members++
          }
        })

        var d = {
          attachments: [{
            color: color,
            title: title,
            thumb_url: guild.iconURL,
            fields: [{
              title: 'Server Name',
              value: guild.name,
              short: true
            }, {
              title: 'Created',
              value: guild.createdAt.toLocaleString(),
              short: true
            }, {
              title: 'ID',
              value: guild.id,
              short: true
            }, {
              title: 'Owner',
              value: guild.owner.user.username,
              short: true
            }, {
              title: 'Member Count',
              value: members,
              short: true
            }, {
              title: 'Bot Count',
              value: bots,
              short: true
            }],
            footer: bot.user.username,
            ts: new Date() / 1000
          }]
        }

        if (guild.features[0]) {
          d.attachments[0].fields.push({
            title: 'Features',
            value: guild.features.join('\n')
          })
          d.attachments[0].text = 'Partnered Server'

          if (guild.features.includes('INVITE_SPLASH')) { d.attachments[0].image_url = guild.splashURL + '?size=2048' }
        }
        if (process.env.LOGWEBHOOK) {
          request({
            url: process.env.LOGWEBHOOK + '/slack',
            method: 'POST',
            body: d,
            json: true
          })
        }
      } catch (err) {
        bot.error(err)
      }
    })
  }

  /**
    * Logging functions
    */

  bot.logCommand = function (command, args, user, channel2, server) {
    bot.webhook('Command Executed', `**Command:** ${command}\n**User:** ${user}\n**Arguments:** ${args}\n**Server:** ${server}\n**Channel:** #${channel2}`, '#0000FF')
  }

  bot.error = function (err) {
    if (bot.shard) {
      console.log(this.timestamp() + ' [SHARD ' + bot.shard.id + '] [ERROR] | ' + err.stack)
      bot.webhook('ERROR', '[SHARD ' + bot.shard.id + '] [ERROR] | ' + err.stack, '#FF0000')
    } else {
      console.log(this.timestamp() + ' [ERROR] | ' + err.stack)
      bot.webhook('ERROR', '[ERROR] | ' + err.stack, '#FF0000')
    }
  }

  bot.debug = function (txt) {
    if (bot.shard) {
      console.log(this.timestamp() + ' [SHARD ' + bot.shard.id + '] [DEBUG] | ' + txt)
    } else {
      console.log(this.timestamp() + ' [DEBUG] | ' + txt)
    }
  }

  bot.warn = function (txt) {
    if (bot.shard) {
      console.log(this.timestamp() + ' [SHARD ' + bot.shard.id + '] [WARN]  | ' + txt)
      bot.webhook('Warning', ' [SHARD ' + bot.shard.id + '] [WARN]  | ' + txt, '#FFFF00')
    } else {
      console.log(this.timestamp() + ' [WARN]  | ' + txt)
      bot.webhook('Warning', '[WARN]  | ' + txt, '#FFFF00')
    }
  }

  bot.log = function (txt) {
    if (bot.shard) {
      console.log(this.timestamp() + ' [SHARD ' + bot.shard.id + ']  [LOG]  | ' + txt)
      bot.webhook('Log', '[SHARD ' + bot.shard.id + '] ' + txt, '#000000')
    } else {
      console.log(this.timestamp() + '  [LOG]  | ' + txt)
      bot.webhook('Log', txt, '#000000')
    }
  }

  bot.timestamp = function () {
    var currentTime = new Date()

    var hours = currentTime.getHours()

    var minutes = currentTime.getMinutes()

    var seconds = currentTime.getSeconds()
    if (minutes < 10) { minutes = '0' + minutes }
    if (seconds < 10) { seconds = '0' + seconds }
    return '[' + hours + ':' + minutes + ':' + seconds + ']'
  }
}
